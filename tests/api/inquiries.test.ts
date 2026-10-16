import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/vehicles/[id]/inquiries/route";
import { db } from "@/lib/db/client";
import { inquiries, vehicles } from "@/lib/db/schema";
import { registerMember, type TestMember, withId } from "./requests";

async function seedVehicle(owner: TestMember, status = "published") {
  const [row] = await db
    .insert(vehicles)
    .values({
      sellerType: "private",
      ownerId: owner.id,
      title: "2019 Toyota RAV4 XLE",
      year: 2019,
      make: "Toyota",
      model: "RAV4",
      price: 29500,
      mileage: 71000,
      municipality: "Etobicoke",
      status,
    })
    .returning();
  return row;
}

async function send(vehicleId: string, message: unknown, options: { cookie?: string; origin?: string | null } = {}) {
  return POST(...withId(vehicleId, `/api/vehicles/${vehicleId}/inquiries`, { method: "POST", body: { message }, ...options }));
}

describe("POST /api/vehicles/[id]/inquiries", () => {
  it("stores the message for the listing's owner", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await seedVehicle(priya);

    const response = await send(car.id, "  Is it still available?  ", { cookie: tendai.cookie });

    expect(response.status).toBe(201);
    const stored = await db.select().from(inquiries);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      vehicleId: car.id,
      senderId: tendai.id,
      recipientId: priya.id,
      message: "Is it still available?",
    });
  });

  it("accepts a message of exactly 2000 characters", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await seedVehicle(priya);

    expect((await send(car.id, "a".repeat(2000), { cookie: tendai.cookie })).status).toBe(201);
  });

  it("rejects an empty message and one over 2000 characters", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await seedVehicle(priya);

    const empty = await send(car.id, "   ", { cookie: tendai.cookie });
    const missing = await send(car.id, undefined, { cookie: tendai.cookie });
    const long = await send(car.id, "a".repeat(2001), { cookie: tendai.cookie });

    expect(empty.status).toBe(400);
    expect(await empty.json()).toEqual({ fieldErrors: { message: "Write a message" } });
    expect(missing.status).toBe(400);
    expect(long.status).toBe(400);
    expect(await long.json()).toEqual({ fieldErrors: { message: "Use 2000 characters or fewer" } });
    expect(await db.select().from(inquiries)).toHaveLength(0);
  });

  it("refuses the owner messaging their own listing", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const car = await seedVehicle(priya);

    expect((await send(car.id, "Hello me", { cookie: priya.cookie })).status).toBe(403);
    expect(await db.select().from(inquiries)).toHaveLength(0);
  });

  it("requires a signed-in member and a same-origin request", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await seedVehicle(priya);

    expect((await send(car.id, "Hi")).status).toBe(401);
    expect((await send(car.id, "Hi", { cookie: tendai.cookie, origin: "https://evil.example" })).status).toBe(403);
    expect((await send(car.id, "Hi", { cookie: tendai.cookie, origin: null })).status).toBe(403);
    expect(await db.select().from(inquiries)).toHaveLength(0);
  });

  it("returns 404 for a sold or removed vehicle, an unknown id and an id that is not a uuid", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const sold = await seedVehicle(priya, "sold");
    const removed = await seedVehicle(priya, "removed");

    for (const id of [sold.id, removed.id, "00000000-0000-4000-8000-000000000000", "not-a-uuid"]) {
      expect((await send(id, "Hi", { cookie: tendai.cookie })).status).toBe(404);
    }
  });
});
