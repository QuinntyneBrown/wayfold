import { describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { providers } from "@/lib/db/schema";
import { POST } from "@/app/api/providers/route";
import { postJson, registerMember } from "./requests";

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
