import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/session/route";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { APP_ORIGIN, registerTendai } from "./requests";

function getSession(cookie?: string) {
  return GET(new Request(`${APP_ORIGIN}/api/session`, { headers: cookie ? { cookie } : {} }));
}

describe("GET /api/session", () => {
  it("returns the signed-in member's id, display name and initials", async () => {
    const cookie = await registerTendai();
    const [user] = await db.select().from(users);

    const response = await getSession(cookie);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: user.id, displayName: "Tendai Mensah", initials: "TM" });
  });

  it("returns 401 without a session cookie", async () => {
    expect((await getSession()).status).toBe(401);
  });

  it("returns 401 for an unknown token", async () => {
    expect((await getSession("wayfold_session=not-a-real-token")).status).toBe(401);
  });

  it("returns 401 for an invalidated session", async () => {
    const cookie = await registerTendai();
    await db.update(sessions).set({ invalidatedAt: new Date() });

    expect((await getSession(cookie)).status).toBe(401);
  });

  it("returns 401 for an expired session", async () => {
    const cookie = await registerTendai();
    const [user] = await db.select().from(users);
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(sessions.userId, user.id));

    expect((await getSession(cookie)).status).toBe(401);
  });
});
