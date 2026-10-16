import { and, asc, count, desc, eq, gte, ilike, lte, or, type SQL, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { providers, users, vehiclePhotos, vehicles } from "@/lib/db/schema";
import { type FieldErrors, text } from "@/lib/validation";

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

export type VehicleSearchQuery = {
  keyword: string;
  sellerType: string | null;
  make: string;
  model: string;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
};

export type ParsedSearch = { ok: true; query: VehicleSearchQuery } | { ok: false; fieldErrors: FieldErrors };

function parsePrice(value: string | null): number | null | "invalid" {
  const price = text(value);
  if (price === "") return null;
  return /^\d+$/.test(price) && Number(price) <= 2_000_000_000 ? Number(price) : "invalid";
}

export function parseSearch(params: URLSearchParams): ParsedSearch {
  const seller = text(params.get("seller"));
  const rawPage = text(params.get("page"));
  const page = rawPage === "" ? 1 : Number(rawPage);

  const minPrice = parsePrice(params.get("minPrice"));
  const maxPrice = parsePrice(params.get("maxPrice"));

  const fieldErrors: FieldErrors = {};
  if (minPrice === "invalid") fieldErrors.minPrice = "Enter a price of 0 or more";
  if (maxPrice === "invalid") fieldErrors.maxPrice = "Enter a price of 0 or more";
  if (typeof minPrice === "number" && typeof maxPrice === "number" && minPrice > maxPrice) fieldErrors.maxPrice = "Max price must be at least min price";
  if (seller !== "" && seller !== "private" && seller !== "dealer") fieldErrors.seller = "Choose private or dealer";
  if (!Number.isInteger(page) || page < 1) fieldErrors.page = "Page must be 1 or more";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    query: {
      keyword: text(params.get("q")),
      sellerType: seller || null,
      make: text(params.get("make")),
      model: text(params.get("model")),
      minPrice: minPrice as number | null,
      maxPrice: maxPrice as number | null,
      page,
    },
  };
}

const sameText = (column: typeof vehicles.make | typeof vehicles.model, value: string) => sql`lower(${column}) = lower(${value})`;

export async function searchVehicles({ keyword, sellerType, make, model, minPrice, maxPrice, page }: VehicleSearchQuery): Promise<VehicleSearchResult> {
  const conditions: SQL[] = [eq(vehicles.status, "published")];
  if (sellerType) conditions.push(eq(vehicles.sellerType, sellerType));
  if (make) conditions.push(sameText(vehicles.make, make));
  if (model) conditions.push(sameText(vehicles.model, model));
  if (minPrice !== null) conditions.push(gte(vehicles.price, minPrice));
  if (maxPrice !== null) conditions.push(lte(vehicles.price, maxPrice));
  if (keyword) {
    const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(ilike(vehicles.title, pattern), ilike(vehicles.make, pattern), ilike(vehicles.model, pattern), ilike(vehicles.description, pattern))!);
  }
  const published = and(...conditions);
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
