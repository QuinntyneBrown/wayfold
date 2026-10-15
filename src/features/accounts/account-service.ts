import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password-hasher";

export type ProfileUpdate = {
  displayName: string;
  gtaArea: string | null;
  homeChurch: string | null;
  showHomeChurch: boolean;
};

export type PasswordChange = { current: string; next: string; keepSessionId: string };

/** True when the password is the member's current one. */
export async function isCurrentPassword(userId: string, password: string) {
  const [user] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, userId));
  return Boolean(user) && verifyPassword(user.hash, password);
}

/** Removes the member; sessions and every other owned record go with them through the cascading foreign keys. */
export async function deleteAccount(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

/** Saves the profile and, with a password change, the new hash and the end of every other session, together. */
export async function updateAccount(userId: string, profile: ProfileUpdate, password?: PasswordChange) {
  const passwordHash = password ? await hashPassword(password.next) : undefined;
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set(passwordHash ? { ...profile, passwordHash } : profile)
      .where(eq(users.id, userId));
    if (password) {
      await tx
        .update(sessions)
        .set({ invalidatedAt: new Date() })
        .where(and(eq(sessions.userId, userId), ne(sessions.id, password.keepSessionId), isNull(sessions.invalidatedAt)));
    }
  });
}
