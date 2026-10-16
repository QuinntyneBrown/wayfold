import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/vehicles/[id]/route";
import { db } from "@/lib/db/client";
import { providers, users, vehiclePhotos, vehicles } from "@/lib/db/schema";
import { registerMember, type TestMember, withId } from "./requests";

type Seed = Partial<typeof vehicles.$inferInsert>;

async function seedVehicle(owner: TestMember, seed: Seed = {}) {
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
      condition: "Used",
      description: "One owner, winter tires included.",
      features: ["Heated seats", "Backup camera"],
      municipality: "Etobicoke",
      ...seed,
    })
    .returning();
  return row;
}

async function view(id: string, cookie?: string) {
  const response = await GET(...withId(id, `/api/vehicles/${id}`, { cookie }));
  return { status: response.status, body: response.status === 200 ? await response.json() : null };
}

describe("GET /api/vehicles/[id]", () => {
  it("returns a private listing with its photos in order and a member seller panel", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const car = await seedVehicle(priya);
    await db.insert(vehiclePhotos).values([
      { vehicleId: car.id, photoRef: "second.jpg", position: 1 },
      { vehicleId: car.id, photoRef: "first.jpg", position: 0 },
    ]);

    const { status, body } = await view(car.id);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: car.id,
      title: "2019 Toyota RAV4 XLE",
      year: 2019,
      make: "Toyota",
      model: "RAV4",
      price: 29500,
      mileage: 71000,
      condition: "Used",
      description: "One owner, winter tires included.",
      features: ["Heated seats", "Backup camera"],
      municipality: "Etobicoke",
      status: "published",
      photos: ["first.jpg", "second.jpg"],
      seller: { sellerType: "private", name: "Priya Nair", profilePath: `/members/${priya.id}`, canMessage: true },
    });
  });

  it("returns a dealer listing with a link to the dealer profile", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const [dealer] = await db.insert(providers).values({ ownerId: priya.id, name: "Eglinton Auto Group", category: "dealer" }).returning();
    const car = await seedVehicle(priya, { sellerType: "dealer", providerId: dealer.id });

    const { body } = await view(car.id);

    expect(body.seller).toEqual({
      sellerType: "dealer",
      name: "Eglinton Auto Group",
      profilePath: `/providers/${dealer.id}`,
      canMessage: true,
    });
  });

  it("shows an opted-in home church only to a signed-in viewer", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    await db.update(users).set({ homeChurch: "Lakeshore Fellowship", showHomeChurch: true }).where(eq(users.id, priya.id));
    const car = await seedVehicle(priya);

    expect((await view(car.id, tendai.cookie)).body.seller.homeChurch).toBe("Lakeshore Fellowship");
    expect((await view(car.id)).body.seller).not.toHaveProperty("homeChurch");
  });

  it("hides the home church when the owner has not opted in", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    await db.update(users).set({ homeChurch: "Lakeshore Fellowship", showHomeChurch: false }).where(eq(users.id, priya.id));
    const car = await seedVehicle(priya);

    expect((await view(car.id, tendai.cookie)).body.seller).not.toHaveProperty("homeChurch");
  });

  it("does not offer messaging to the owner or on a sold listing", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const available = await seedVehicle(priya);
    const sold = await seedVehicle(priya, { status: "sold" });

    expect((await view(available.id, priya.cookie)).body.seller.canMessage).toBe(false);
    expect((await view(available.id, tendai.cookie)).body.seller.canMessage).toBe(true);
    const soldView = await view(sold.id, tendai.cookie);
    expect(soldView.body.status).toBe("sold");
    expect(soldView.body.seller.canMessage).toBe(false);
  });

  it("returns 404 for a removed vehicle, an unknown id and an id that is not a uuid", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const removed = await seedVehicle(priya, { status: "removed" });

    expect((await view(removed.id)).status).toBe(404);
    expect((await view("00000000-0000-4000-8000-000000000000")).status).toBe(404);
    expect((await view("not-a-uuid")).status).toBe(404);
  });
});
