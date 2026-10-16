import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/providers/[id]/route";
import { db } from "@/lib/db/client";
import { providers, users } from "@/lib/db/schema";
import { registerMember, type TestMember, withId } from "./requests";

async function seedProvider(owner: TestMember) {
  const [row] = await db
    .insert(providers)
    .values({
      ownerId: owner.id,
      name: "Danforth Auto Care",
      category: "mechanic",
      municipality: "Toronto",
      description: "Honest repairs and clear explanations for Toronto drivers.",
      contactEmail: "hello@danforthautocare.example",
      phone: "416-555-0123",
    })
    .returning();
  return row;
}

async function view(id: string, cookie?: string) {
  const response = await GET(...withId(id, `/api/providers/${id}`, { cookie }));
  return { status: response.status, body: response.status === 200 ? await response.json() : null };
}

describe("GET /api/providers/[id]", () => {
  it("shows a visitor the profile with its category label, area, description and contact", async () => {
    const owner = await registerMember("Samuel Adeyemi", "samuel@example.com");
    const provider = await seedProvider(owner);

    const { status, body } = await view(provider.id);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: provider.id,
      name: "Danforth Auto Care",
      category: "mechanic",
      categoryLabel: "Mechanic",
      municipality: "Toronto",
      description: "Honest repairs and clear explanations for Toronto drivers.",
      contactEmail: "hello@danforthautocare.example",
      phone: "416-555-0123",
      isOwner: false,
    });
  });

  it("answers 404 to an unknown or malformed id", async () => {
    expect((await view("00000000-0000-4000-8000-000000000000")).status).toBe(404);
    expect((await view("not-an-id")).status).toBe(404);
  });

  it("states the owner's church only to a signed-in viewer and only when the owner opted in", async () => {
    const owner = await registerMember("Samuel Adeyemi", "samuel@example.com");
    const viewer = await registerMember("Tendai Mensah", "tendai@example.com");
    const provider = await seedProvider(owner);
    await db.update(users).set({ homeChurch: "St. Paul's Anglican", showHomeChurch: false }).where(eq(users.id, owner.id));

    expect((await view(provider.id, viewer.cookie)).body).not.toHaveProperty("ownerChurch");

    await db.update(users).set({ showHomeChurch: true }).where(eq(users.id, owner.id));

    expect((await view(provider.id, viewer.cookie)).body.ownerChurch).toBe("St. Paul's Anglican");
    expect((await view(provider.id)).body).not.toHaveProperty("ownerChurch");
  });

  it("tells the owner, and only the owner, that the profile is theirs", async () => {
    const owner = await registerMember("Samuel Adeyemi", "samuel@example.com");
    const other = await registerMember("Tendai Mensah", "tendai@example.com");
    const provider = await seedProvider(owner);

    expect((await view(provider.id, owner.cookie)).body.isOwner).toBe(true);
    expect((await view(provider.id, other.cookie)).body.isOwner).toBe(false);
  });
});
