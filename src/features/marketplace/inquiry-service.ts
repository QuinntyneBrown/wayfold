import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inquiries, vehicles } from "@/lib/db/schema";
import { isUuid } from "@/lib/validation";

export const MAX_INQUIRY_LENGTH = 2000;

export type InquiryOutcome = "sent" | "not-found" | "own-listing";

/** Stores a message for the owner of a published vehicle; the viewer must not be that owner. */
export async function sendInquiry(senderId: string, vehicleId: string, message: string): Promise<InquiryOutcome> {
  if (!isUuid(vehicleId)) return "not-found";
  const [vehicle] = await db
    .select({ ownerId: vehicles.ownerId })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.status, "published")));
  if (!vehicle) return "not-found";
  if (vehicle.ownerId === senderId) return "own-listing";
  await db.insert(inquiries).values({ vehicleId, senderId, recipientId: vehicle.ownerId, message });
  return "sent";
}
