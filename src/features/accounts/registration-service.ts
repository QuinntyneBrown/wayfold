import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { startSession } from "./auth-service";
import { hashPassword } from "./password-hasher";

export type RegisterRequest = { displayName: string; email: string; password: string };
export type RegisterResult = { ok: true; token: string } | { ok: false; reason: "duplicate-email" };

const UNIQUE_VIOLATION = "23505";

export async function register(request: RegisterRequest): Promise<RegisterResult> {
  const passwordHash = await hashPassword(request.password);
  let token: string;

  try {
    token = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: request.email, displayName: request.displayName, passwordHash })
        .returning({ id: users.id });
      return startSession(tx, user.id);
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "duplicate-email" };
    throw error;
  }

  return { ok: true, token };
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === UNIQUE_VIOLATION) return true;
  return "cause" in error && isUniqueViolation(error.cause);
}
