import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { providers } from "@/lib/db/schema";
import { POST } from "@/app/api/providers/route";
import { PUT } from "@/app/api/providers/[id]/route";
import { postJson, registerMember, withId } from "./requests";

const BUSINESS = {
  name: "Danforth Auto Care",
  category: "mechanic",
  municipality: "Toronto",
  description: "Honest repairs and clear explanations for Toronto drivers.",
  contactEmail: "hello@danforthautocare.example",
  phone: "416-555-0123",
};

describe("POST /api/providers", () => {
  it("creates a profile owned by the signed-in member", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await POST(postJson("/api/providers", BUSINESS, { cookie: tendai.cookie }));

    expect(response.status).toBe(201);
    const { id } = await response.json();
    const [saved] = await db.select().from(providers);
    expect(saved).toMatchObject({ id, ownerId: tendai.id, ...BUSINESS });
  });

  it("rejects missing required fields with inline errors and saves nothing", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await POST(postJson("/api/providers", { ...BUSINESS, name: "", description: " ", contactEmail: "nope" }, { cookie: tendai.cookie }));

    expect(response.status).toBe(400);
    const { fieldErrors } = await response.json();
    expect(Object.keys(fieldErrors).sort()).toEqual(["contactEmail", "description", "name"]);
    expect(await db.select().from(providers)).toHaveLength(0);
  });

  it("rejects a category outside the nine and a municipality outside the GTA", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await POST(postJson("/api/providers", { ...BUSINESS, category: "florist", municipality: "Ottawa" }, { cookie: tendai.cookie }));

    expect(response.status).toBe(400);
    const { fieldErrors } = await response.json();
    expect(Object.keys(fieldErrors).sort()).toEqual(["category", "municipality"]);
    expect(await db.select().from(providers)).toHaveLength(0);
  });

  it("answers 401 to a signed-out visitor and 403 to a foreign origin", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    expect((await POST(postJson("/api/providers", BUSINESS))).status).toBe(401);
    expect((await POST(postJson("/api/providers", BUSINESS, { cookie: tendai.cookie, origin: "https://evil.example" }))).status).toBe(403);
    expect(await db.select().from(providers)).toHaveLength(0);
  });
});

describe("PUT /api/providers/[id]", () => {
  async function seed() {
    const owner = await registerMember("Samuel Adeyemi", "samuel@example.com");
    const [provider] = await db.insert(providers).values({ ownerId: owner.id, ...BUSINESS }).returning();
    return { owner, provider };
  }
  const edit = (id: string, body: unknown, options: { cookie?: string; origin?: string | null } = {}) =>
    PUT(...withId(id, `/api/providers/${id}`, { method: "PUT", body, ...options }));

  it("saves the owner's changes", async () => {
    const { owner, provider } = await seed();

    const response = await edit(provider.id, { ...BUSINESS, name: "Danforth Auto & Tire", phone: "" }, { cookie: owner.cookie });

    expect(response.status).toBe(200);
    const [saved] = await db.select().from(providers).where(eq(providers.id, provider.id));
    expect(saved).toMatchObject({ name: "Danforth Auto & Tire", phone: null, ownerId: owner.id });
  });

  it("answers 403 to another member and leaves the profile unchanged", async () => {
    const { provider } = await seed();
    const other = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await edit(provider.id, { ...BUSINESS, name: "Hijacked" }, { cookie: other.cookie });

    expect(response.status).toBe(403);
    const [saved] = await db.select().from(providers).where(eq(providers.id, provider.id));
    expect(saved.name).toBe("Danforth Auto Care");
  });

  it("rejects invalid fields with inline errors and keeps the saved profile", async () => {
    const { owner, provider } = await seed();

    const response = await edit(provider.id, { ...BUSINESS, name: "", category: "florist" }, { cookie: owner.cookie });

    expect(response.status).toBe(400);
    expect(Object.keys((await response.json()).fieldErrors).sort()).toEqual(["category", "name"]);
    const [saved] = await db.select().from(providers).where(eq(providers.id, provider.id));
    expect(saved.name).toBe("Danforth Auto Care");
  });

  it("answers 401 signed out, 403 to a foreign origin and 404 to an unknown profile", async () => {
    const { owner, provider } = await seed();

    expect((await edit(provider.id, BUSINESS)).status).toBe(401);
    expect((await edit(provider.id, BUSINESS, { cookie: owner.cookie, origin: "https://evil.example" })).status).toBe(403);
    expect((await edit("00000000-0000-4000-8000-000000000000", BUSINESS, { cookie: owner.cookie })).status).toBe(404);
  });
});
