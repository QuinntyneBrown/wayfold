import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { follows, users } from "@/lib/db/schema";
import { projectMember } from "@/lib/member-view-policy";
import { isUuid } from "@/lib/validation";

/** The profile as the signed-in viewer may see it, or null for an unknown member. Listings and recommendations wait for their features. */
export async function loadProfile(id: string, viewerId: string) {
  if (!isUuid(id)) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) return null;

  const [{ followers }] = await db.select({ followers: count() }).from(follows).where(eq(follows.followeeId, id));
  const [follow] = await db
    .select({ id: follows.followerId })
    .from(follows)
    .where(and(eq(follows.followerId, viewerId), eq(follows.followeeId, id)));

  return {
    ...projectMember(user, true),
    bio: user.bio,
    followers,
    following: Boolean(follow),
    isOwner: user.id === viewerId,
    garage: [],
    posts: [],
    listings: [],
    recommendations: [],
  };
}

export async function saveBio(userId: string, bio: string | null) {
  await db.update(users).set({ bio }).where(eq(users.id, userId));
}
