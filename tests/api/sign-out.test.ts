import { describe, expect, it } from "vitest";
import { POST as signIn } from "@/app/api/auth/sign-in/route";
import { POST } from "@/app/api/auth/sign-out/route";
import { GET as getSession } from "@/app/api/session/route";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { APP_ORIGIN, postJson, registerTendai, sessionCookie, TENDAI } from "./requests";

function signOut(cookie: string, options?: { origin?: string | null }) {
  return POST(postJson("/api/auth/sign-out", {}, { cookie, ...options }));
}

function sessionStatus(cookie: string) {
  return getSession(new Request(`${APP_ORIGIN}/api/session`, { headers: { cookie } })).then((r) => r.status);
}

describe("POST /api/auth/sign-out", () => {
  it("invalidates the session and clears the cookie, so the old token no longer works", async () => {
    const cookie = await registerTendai();

    const response = await signOut(cookie);

    expect(response.status).toBe(204);
    const cleared = sessionCookie(response);
    expect(cleared.name).toBe("wayfold_session");
    expect(cleared.value).toBe("");
    expect(cleared.attributes).toContain("max-age=0");
    const [session] = await db.select().from(sessions);
    expect(session.invalidatedAt).not.toBeNull();
    expect(await sessionStatus(cookie)).toBe(401);
  });

  it("leaves the member's other sessions signed in", async () => {
    const first = await registerTendai();
    const other = sessionCookie(await signIn(postJson("/api/auth/sign-in", TENDAI)));
    const otherCookie = `${other.name}=${other.value}`;

    await signOut(first);

    expect(await sessionStatus(otherCookie)).toBe(200);
  });

  it("rejects a request without a same-origin Origin header and keeps the session", async () => {
    const cookie = await registerTendai();

    const response = await signOut(cookie, { origin: null });

    expect(response.status).toBe(403);
    expect(await sessionStatus(cookie)).toBe(200);
  });
});
