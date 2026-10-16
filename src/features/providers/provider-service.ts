import { db } from "@/lib/db/client";
import { providers } from "@/lib/db/schema";
import { isGtaArea } from "@/lib/gta-areas";
import { isProviderCategory } from "@/lib/provider-categories";
import { type FieldErrors, isEmail, text } from "@/lib/validation";

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
