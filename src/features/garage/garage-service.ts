import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { garageCars } from "@/lib/db/schema";
import { type FieldErrors, isUuid, text } from "@/lib/validation";
import { deletePhoto, MAX_PHOTO_BYTES, savePhoto, sniffImage } from "./photo-store";

export type CarFields = { year: number; make: string; model: string; nickname: string | null; notes: string | null };
export type Car = CarFields & { id: string; photoRef: string | null };

const columns = {
  id: garageCars.id,
  year: garageCars.year,
  make: garageCars.make,
  model: garageCars.model,
  nickname: garageCars.nickname,
  photoRef: garageCars.photoRef,
  notes: garageCars.notes,
};

export type Parsed = { ok: true; fields: CarFields; photo: File | null } | { ok: false; fieldErrors: FieldErrors };

/** Reads and validates the multipart form shared by add and edit. The photo itself is checked when it is saved. */
export function parseCar(form: FormData): Parsed {
  const year = text(form.get("year"));
  const make = text(form.get("make"));
  const model = text(form.get("model"));
  const nickname = text(form.get("nickname"));
  const notes = text(form.get("notes"));
  const photo = form.get("photo");

  const fieldErrors: FieldErrors = {};
  const maxYear = new Date().getFullYear() + 1;
  if (!/^\d{4}$/.test(year) || Number(year) < 1900 || Number(year) > maxYear) fieldErrors.year = "Enter a year";
  if (!make) fieldErrors.make = "Enter a make";
  if (!model) fieldErrors.model = "Enter a model";
  if (nickname.length > 40) fieldErrors.nickname = "Use 40 characters or fewer";
  if (notes.length > 500) fieldErrors.notes = "Use 500 characters or fewer";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    fields: { year: Number(year), make, model, nickname: nickname || null, notes: notes || null },
    photo: photo instanceof File && photo.size > 0 ? photo : null,
  };
}

/** Saves an uploaded photo and returns its reference, or the message that rejects it. */
export async function storePhoto(photo: File): Promise<{ ok: true; ref: string } | { ok: false; error: string }> {
  if (photo.size > MAX_PHOTO_BYTES) return { ok: false, error: "Use an image under 5 MB" };
  const bytes = new Uint8Array(await photo.arrayBuffer());
  const extension = sniffImage(bytes);
  if (!extension) return { ok: false, error: "Choose a JPEG, PNG or WebP image" };
  return { ok: true, ref: await savePhoto(bytes, extension) };
}

export async function addCar(ownerId: string, fields: CarFields, photoRef: string | null): Promise<Car> {
  const [car] = await db.insert(garageCars).values({ ownerId, ...fields, photoRef }).returning(columns);
  return car;
}

export async function carsOf(ownerId: string): Promise<Car[]> {
  return db.select(columns).from(garageCars).where(eq(garageCars.ownerId, ownerId)).orderBy(desc(garageCars.createdAt));
}

/** The car with its owner, or null for an unknown or malformed id. */
export async function findCar(id: string) {
  if (!isUuid(id)) return null;
  const [car] = await db
    .select({ ...columns, ownerId: garageCars.ownerId })
    .from(garageCars)
    .where(eq(garageCars.id, id));
  return car ?? null;
}

/** Updates the car; a new photo replaces the old one, otherwise the photo stays. */
export async function editCar(
  id: string,
  fields: CarFields,
  newPhotoRef: string | null,
  oldPhotoRef: string | null,
): Promise<Car> {
  const [car] = await db
    .update(garageCars)
    .set(newPhotoRef ? { ...fields, photoRef: newPhotoRef } : fields)
    .where(eq(garageCars.id, id))
    .returning(columns);
  if (newPhotoRef) await deletePhoto(oldPhotoRef);
  return car;
}

export async function removeCar(id: string, photoRef: string | null) {
  await db.delete(garageCars).where(eq(garageCars.id, id));
  await deletePhoto(photoRef);
}
