import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { providers, users } from "@/lib/db/schema";
import { isGtaArea } from "@/lib/gta-areas";
import { projectMember } from "@/lib/member-view-policy";
import { PROVIDER_CATEGORIES, isProviderCategory } from "@/lib/provider-categories";
import { type FieldErrors, isEmail, isUuid, text } from "@/lib/validation";

export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;

export type ProviderInput = {
  name: string;
  category: string;
  municipality: string;
  description: string;
  contactEmail: string;
  phone: string | null;
};

type Parsed = { ok: true; input: ProviderInput } | { ok: false; fieldErrors: FieldErrors };

export function parseProvider(body: Record<string, unknown>): Parsed {
  const input = {
    name: text(body.name),
    category: text(body.category),
    municipality: text(body.municipality),
    description: text(body.description),
    contactEmail: text(body.contactEmail),
    phone: text(body.phone) || null,
  };
  const fieldErrors: FieldErrors = {};
  if (!input.name) fieldErrors.name = "Enter a name";
  else if (input.name.length > MAX_NAME_LENGTH) fieldErrors.name = `Use ${MAX_NAME_LENGTH} characters or fewer`;
  if (!isProviderCategory(input.category)) fieldErrors.category = "Choose a category";
  if (!isGtaArea(input.municipality)) fieldErrors.municipality = "Choose a GTA municipality";
  if (!input.description) fieldErrors.description = "Describe what you do";
  else if (input.description.length > MAX_DESCRIPTION_LENGTH) fieldErrors.description = `Use ${MAX_DESCRIPTION_LENGTH} characters or fewer`;
  if (!isEmail(input.contactEmail)) fieldErrors.contactEmail = "Enter a contact email";
  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, input };
}

export async function createProvider(ownerId: string, input: ProviderInput) {
  const [created] = await db.insert(providers).values({ ownerId, ...input }).returning({ id: providers.id });
  return created.id;
}

export type ProviderDetail = ProviderInput & {
  id: string;
  categoryLabel: string;
  isOwner: boolean;
  ownerChurch?: string;
};

type Viewer = { id: string } | null;

/** A provider profile as the viewer may see it, or null when it does not exist (L2-030, L2-023). */
export async function getProviderDetail(id: string, viewer: Viewer): Promise<ProviderDetail | null> {
  if (!isUuid(id)) return null;
  const [row] = await db
    .select({ provider: providers, owner: users })
    .from(providers)
    .innerJoin(users, eq(users.id, providers.ownerId))
    .where(eq(providers.id, id));
  if (!row) return null;

  const { provider, owner } = row;
  const detail: ProviderDetail = {
    id: provider.id,
    name: provider.name,
    category: provider.category,
    categoryLabel: PROVIDER_CATEGORIES.find((c) => c.value === provider.category)?.label ?? provider.category,
    municipality: provider.municipality ?? "",
    description: provider.description,
    contactEmail: provider.contactEmail ?? "",
    phone: provider.phone,
    isOwner: viewer?.id === owner.id,
  };
  const { homeChurch } = projectMember(owner, viewer !== null);
  if (homeChurch) detail.ownerChurch = homeChurch;
  return detail;
}
