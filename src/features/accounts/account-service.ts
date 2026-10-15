import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type ProfileUpdate = {
  displayName: string;
  gtaArea: string | null;
  homeChurch: string | null;
  showHomeChurch: boolean;
};

export async function updateProfile(userId: string, profile: ProfileUpdate) {
  await db.update(users).set(profile).where(eq(users.id, userId));
}
