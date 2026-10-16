import { asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { providers, users, vehiclePhotos, vehicles } from "@/lib/db/schema";

export const PAGE_SIZE = 20;

export type VehicleCard = {
  id: string;
  title: string;
  price: number;
  year: number;
  make: string;
  model: string;
  mileage: number;
  municipality: string;
  sellerType: string;
  sellerName: string;
  photoRef: string | null;
};

export type VehicleSearchResult = { items: VehicleCard[]; total: number; page: number; pageSize: number };

export async function searchVehicles(page: number): Promise<VehicleSearchResult> {
  const published = eq(vehicles.status, "published");
  const [{ total }] = await db.select({ total: count() }).from(vehicles).where(published);
  const items = await db
    .select({
      id: vehicles.id,
      title: vehicles.title,
      price: vehicles.price,
      year: vehicles.year,
      make: vehicles.make,
      model: vehicles.model,
      mileage: vehicles.mileage,
      municipality: vehicles.municipality,
      sellerType: vehicles.sellerType,
      sellerName: sql<string>`coalesce(${providers.name}, ${users.displayName})`,
      photoRef: sql<string | null>`(select ${vehiclePhotos.photoRef} from ${vehiclePhotos} where ${vehiclePhotos.vehicleId} = ${vehicles.id} order by ${asc(vehiclePhotos.position)} limit 1)`,
    })
    .from(vehicles)
    .innerJoin(users, eq(users.id, vehicles.ownerId))
    .leftJoin(providers, eq(providers.id, vehicles.providerId))
    .where(published)
    .orderBy(desc(vehicles.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { items, total, page, pageSize: PAGE_SIZE };
}
