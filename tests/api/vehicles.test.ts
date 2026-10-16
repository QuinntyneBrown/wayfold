import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/vehicles/route";
import { db } from "@/lib/db/client";
import { providers, vehiclePhotos, vehicles } from "@/lib/db/schema";
import { APP_ORIGIN, registerMember, type TestMember } from "./requests";

type Seed = Partial<typeof vehicles.$inferInsert>;

let counter = 0;
async function seedVehicle(owner: TestMember, seed: Seed = {}) {
  counter += 1;
  const [row] = await db
    .insert(vehicles)
    .values({
      sellerType: "private",
      ownerId: owner.id,
      title: `2019 Toyota RAV4 ${counter}`,
      year: 2019,
      make: "Toyota",
      model: "RAV4",
      price: 29500,
      mileage: 71000,
      municipality: "Etobicoke",
      createdAt: new Date(Date.now() - (1000 - counter) * 1000),
      ...seed,
    })
    .returning();
  return row;
}

async function search(query = "") {
  const response = await GET(new Request(`${APP_ORIGIN}/api/vehicles${query}`));
  return { status: response.status, body: await response.json() };
}

describe("GET /api/vehicles", () => {
  it("lists published vehicles newest first, 20 per page, with the seller and first photo", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const [dealer] = await db.insert(providers).values({ ownerId: priya.id, name: "Eglinton Auto Group", category: "dealer" }).returning();
    for (let i = 0; i < 21; i++) await seedVehicle(priya);
    const dealerCar = await seedVehicle(priya, { sellerType: "dealer", providerId: dealer.id, title: "Newest dealer car", createdAt: new Date() });
    await db.insert(vehiclePhotos).values([
      { vehicleId: dealerCar.id, photoRef: "second.jpg", position: 1 },
      { vehicleId: dealerCar.id, photoRef: "first.jpg", position: 0 },
    ]);
    await seedVehicle(priya, { status: "removed" });
    await seedVehicle(priya, { status: "sold" });

    const first = await search();
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ total: 22, page: 1, pageSize: 20 });
    expect(first.body.items).toHaveLength(20);
    expect(first.body.items[0]).toEqual({
      id: dealerCar.id,
      title: "Newest dealer car",
      price: 29500,
      year: 2019,
      make: "Toyota",
      model: "RAV4",
      mileage: 71000,
      municipality: "Etobicoke",
      sellerType: "dealer",
      sellerName: "Eglinton Auto Group",
      photoRef: "first.jpg",
    });
    expect(first.body.items[1]).toMatchObject({ sellerType: "private", sellerName: "Priya Nair", photoRef: null });

    const second = await search("?page=2");
    expect(second.body.items).toHaveLength(2);
  });
});
