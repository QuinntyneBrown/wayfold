import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectMember } from "@/lib/member-view-policy";
import { providers, users, vehiclePhotos, vehicles } from "@/lib/db/schema";
import { isUuid } from "@/lib/validation";

export type SellerPanel = {
  sellerType: string;
  name: string;
  profilePath: string;
  homeChurch?: string;
  canMessage: boolean;
};

export type VehicleDetail = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  condition: string | null;
  description: string;
  features: string[];
  municipality: string;
  status: string;
  photos: string[];
  seller: SellerPanel;
};

type Viewer = { id: string } | null;

/** A published or sold vehicle as the viewer may see it, or null when it is missing or removed. */
export async function getVehicleDetail(id: string, viewer: Viewer): Promise<VehicleDetail | null> {
  if (!isUuid(id)) return null;
  const [row] = await db
    .select({ vehicle: vehicles, owner: users, provider: providers })
    .from(vehicles)
    .innerJoin(users, eq(users.id, vehicles.ownerId))
    .leftJoin(providers, eq(providers.id, vehicles.providerId))
    .where(eq(vehicles.id, id));
  if (!row || (row.vehicle.status !== "published" && row.vehicle.status !== "sold")) return null;

  const { vehicle, owner, provider } = row;
  const photos = await db
    .select({ photoRef: vehiclePhotos.photoRef })
    .from(vehiclePhotos)
    .where(eq(vehiclePhotos.vehicleId, id))
    .orderBy(asc(vehiclePhotos.position));
  const canMessage = vehicle.status === "published" && viewer?.id !== owner.id;

  const { homeChurch } = projectMember(owner, viewer !== null);
  const seller: SellerPanel = provider
    ? { sellerType: "dealer", name: provider.name, profilePath: `/providers/${provider.id}`, canMessage }
    : { sellerType: "private", name: owner.displayName, profilePath: `/members/${owner.id}`, canMessage };
  if (!provider && homeChurch) seller.homeChurch = homeChurch;

  return {
    id: vehicle.id,
    title: vehicle.title,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    price: vehicle.price,
    mileage: vehicle.mileage,
    condition: vehicle.condition,
    description: vehicle.description,
    features: vehicle.features,
    municipality: vehicle.municipality,
    status: vehicle.status,
    photos: photos.map((photo) => photo.photoRef),
    seller,
  };
}
