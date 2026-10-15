import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { readSessionToken, sessionIdFor } from "@/lib/session-cookie";

export type Member = { id: string; displayName: string };

/** The member whose active (not invalidated, not expired) session the request carries, or null. */
export async function currentMember(request: Request): Promise<Member | null> {
  const token = readSessionToken(request);
  if (!token) return null;

  const [member] = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(eq(sessions.id, sessionIdFor(token)), isNull(sessions.invalidatedAt), gt(sessions.expiresAt, new Date())),
    );
  return member ?? null;
}

export function initialsOf(displayName: string) {
  const words = displayName.trim().split(/\s+/);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => word[0]?.toUpperCase() ?? "").join("");
}
