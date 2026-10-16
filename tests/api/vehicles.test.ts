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
  it("narrows by seller type, make and model, ignoring case", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const [dealer] = await db.insert(providers).values({ ownerId: priya.id, name: "Eglinton Auto Group", category: "dealer" }).returning();
    await seedVehicle(priya, { title: "Private RAV4" });
    await seedVehicle(priya, { title: "Dealer Civic", sellerType: "dealer", providerId: dealer.id, make: "Honda", model: "Civic" });

    expect((await search("?seller=private")).body.items.map((v: { title: string }) => v.title)).toEqual(["Private RAV4"]);
    expect((await search("?seller=dealer")).body.items.map((v: { title: string }) => v.title)).toEqual(["Dealer Civic"]);
    expect((await search("?make=honda")).body.total).toBe(1);
    expect((await search("?make=Honda&model=civic")).body.total).toBe(1);
    expect((await search("?make=Honda&model=RAV4")).body.total).toBe(0);
  });

  it("rejects an unknown seller type", async () => {
    const result = await search("?seller=robot");
    expect(result.status).toBe(400);
    expect(result.body.fieldErrors).toHaveProperty("seller");
  });
  it("finds a keyword in title, make, model or description, ignoring case", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    await seedVehicle(priya, { title: "Family hauler", description: "One owner, winter tires included" });
    await seedVehicle(priya, { title: "Commuter", make: "Mazda", model: "Mazda3" });

    expect((await search("?q=WINTER")).body.total).toBe(1);
    expect((await search("?q=hauler")).body.total).toBe(1);
    expect((await search("?q=mazda")).body.total).toBe(1);
    expect((await search("?q=rav4")).body.total).toBe(1);
    expect((await search("?q=%25")).body.total).toBe(0);
    expect((await search("?q=submarine")).body.total).toBe(0);
  });

  it("limits price to the inclusive range", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    for (const price of [10000, 15000, 20000, 25000]) await seedVehicle(priya, { price });

    const prices = async (query: string) => (await search(query)).body.items.map((v: { price: number }) => v.price).sort();
    expect(await prices("?minPrice=15000&maxPrice=20000")).toEqual([15000, 20000]);
    expect(await prices("?minPrice=20000")).toEqual([20000, 25000]);
    expect(await prices("?maxPrice=10000")).toEqual([10000]);
  });

  it.each(["?minPrice=-1", "?maxPrice=abc", "?minPrice=20000&maxPrice=10000"])("rejects the price range %s", async (query) => {
    const result = await search(query);
    expect(result.status).toBe(400);
    expect(Object.keys(result.body.fieldErrors).some((k) => k === "minPrice" || k === "maxPrice")).toBe(true);
  });
});
