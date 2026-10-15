import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import {
  newSessionToken,
  readSessionToken,
  SESSION_LIFETIME_SECONDS,
  sessionIdFor,
} from "@/lib/session-cookie";
import { hashPassword, verifyPassword } from "./password-hasher";

export type Member = { id: string; displayName: string };
export type SignInResult = { ok: true; token: string; displayName: string } | { ok: false; reason: "rejected" };

/** A real argon2id hash, verified when no account matches so both failures take the same time. */
let timingHash: Promise<string> | undefined;

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    await verifyPassword(await (timingHash ??= hashPassword("wayfold-timing-equaliser")), password);
    return { ok: false, reason: "rejected" };
  }

  if (!(await verifyPassword(user.passwordHash, password))) return { ok: false, reason: "rejected" };

  return { ok: true, token: await startSession(db, user.id), displayName: user.displayName };
}

/** Creates a session for the user and returns the cookie token; only its SHA-256 is stored. */
export async function startSession(executor: Pick<typeof db, "insert">, userId: string) {
  const token = newSessionToken();
  await executor.insert(sessions).values({
    id: sessionIdFor(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000),
  });
  return token;
}

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
