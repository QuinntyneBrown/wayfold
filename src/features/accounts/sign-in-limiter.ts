import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { failedSignIns } from "@/lib/db/schema";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

/** True when the account has 5 failed sign-ins in the last 15 minutes (L2-017 AC2). */
export async function isLockedOut(userId: string) {
  const [{ failures }] = await db
    .select({ failures: count() })
    .from(failedSignIns)
    .where(and(eq(failedSignIns.userId, userId), gt(failedSignIns.attemptedAt, new Date(Date.now() - WINDOW_MS))));
  return failures >= MAX_FAILURES;
}

export async function recordFailure(userId: string) {
  await db.insert(failedSignIns).values({ userId });
}
