import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { follows, users } from "@/lib/db/schema";
import { isUuid } from "@/lib/validation";

export type FollowResult = { ok: true; followers: number } | { ok: false; reason: "unknown" | "self" };

/** Follows or unfollows a member and returns their new follower count. A repeated follow changes nothing. */
export async function setFollowing(followerId: string, followeeId: string, following: boolean): Promise<FollowResult> {
  if (!isUuid(followeeId)) return { ok: false, reason: "unknown" };
  const [member] = await db.select({ id: users.id }).from(users).where(eq(users.id, followeeId));
  if (!member) return { ok: false, reason: "unknown" };
  if (followerId === followeeId) return { ok: false, reason: "self" };

  if (following) {
    await db.insert(follows).values({ followerId, followeeId }).onConflictDoNothing();
  } else {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
  }
  const [{ followers }] = await db.select({ followers: count() }).from(follows).where(eq(follows.followeeId, followeeId));
  return { ok: true, followers };
}
