import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE = "wayfold_session";
export const SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function sessionIdFor(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionCookieHeader(token: string) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_LIFETIME_SECONDS}`;
}
