import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/account/route";
import { APP_ORIGIN, postJson, registerTendai, sessionCookie, TENDAI } from "./requests";

function getAccount(cookie?: string) {
  return GET(new Request(`${APP_ORIGIN}/api/account`, { headers: cookie ? { cookie } : {} }));
}

describe("GET /api/account", () => {
  it("returns 401 without a session", async () => {
    expect((await getAccount()).status).toBe(401);
  });

  it("returns the signed-in member's own settings", async () => {
    const cookie = await registerTendai();

    const response = await getAccount(cookie);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      displayName: "Tendai Mensah",
      gtaArea: null,
      homeChurch: null,
      showHomeChurch: false,
    });
  });
});

describe("PUT /api/account (profile)", () => {
  const valid = { displayName: "Tendai M.", gtaArea: "Brampton", homeChurch: "Lakeshore Fellowship", showHomeChurch: true };

  async function put(body: unknown, options?: { cookie?: string; origin?: string | null }) {
    const { PUT } = await import("@/app/api/account/route");
    return PUT(postJson("/api/account", body, options, "PUT"));
  }

  it("saves the profile and returns it on the next read", async () => {
    const cookie = await registerTendai();

    const response = await put(valid, { cookie });

    expect(response.status).toBe(200);
    expect(await (await getAccount(cookie)).json()).toEqual(valid);
  });

  it("stores an empty church as null and an empty area as null", async () => {
    const cookie = await registerTendai();

    await put({ ...valid, gtaArea: "", homeChurch: "  ", showHomeChurch: false }, { cookie });

    expect(await (await getAccount(cookie)).json()).toEqual({
      displayName: "Tendai M.",
      gtaArea: null,
      homeChurch: null,
      showHomeChurch: false,
    });
  });

  it("rejects a long church, a blank name and an area outside the list, saving nothing", async () => {
    const cookie = await registerTendai();

    const response = await put({ displayName: " ", gtaArea: "Hamilton", homeChurch: "x".repeat(81), showHomeChurch: true }, { cookie });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      fieldErrors: {
        displayName: "Enter your name",
        gtaArea: "Choose an area from the list",
        homeChurch: "Use 80 characters or fewer",
      },
    });
    expect((await (await getAccount(cookie)).json()).displayName).toBe("Tendai Mensah");
  });

  it("accepts an 80-character church", async () => {
    const cookie = await registerTendai();

    expect((await put({ ...valid, homeChurch: "x".repeat(80) }, { cookie })).status).toBe(200);
  });

  it("returns 401 without a session and 403 without a same-origin Origin", async () => {
    const cookie = await registerTendai();

    expect((await put(valid)).status).toBe(401);
    expect((await put(valid, { cookie, origin: null })).status).toBe(403);
  });

  it("stores injection-looking text verbatim as plain text", async () => {
    const cookie = await registerTendai();
    const name = "Robert'); drop table users;--<script>alert(1)</script>";

    expect((await put({ ...valid, displayName: name }, { cookie })).status).toBe(200);
    expect((await (await getAccount(cookie)).json()).displayName).toBe(name);
  });
});

describe("PUT /api/account (password)", () => {
  const profile = { displayName: "Tendai Mensah", gtaArea: "", homeChurch: "", showHomeChurch: false };
  const NEW_PASSWORD = "a brand new passphrase";

  async function put(body: unknown, cookie: string) {
    const { PUT } = await import("@/app/api/account/route");
    return PUT(postJson("/api/account", body, { cookie }, "PUT"));
  }

  async function signInWith(password: string) {
    const { POST } = await import("@/app/api/auth/sign-in/route");
    return POST(postJson("/api/auth/sign-in", { email: TENDAI.email, password }));
  }

  async function sessionStatus(cookie: string) {
    const { GET: getSession } = await import("@/app/api/session/route");
    return (await getSession(new Request(`${APP_ORIGIN}/api/session`, { headers: { cookie } }))).status;
  }

  it("changes the password, keeps this session and signs out the others", async () => {
    const thisSession = await registerTendai();
    const other = sessionCookie(await signInWith(TENDAI.password));
    const otherCookie = `${other.name}=${other.value}`;

    const response = await put({ ...profile, currentPassword: TENDAI.password, newPassword: NEW_PASSWORD }, thisSession);

    expect(response.status).toBe(200);
    expect(await sessionStatus(thisSession)).toBe(200);
    expect(await sessionStatus(otherCookie)).toBe(401);
    expect((await signInWith(NEW_PASSWORD)).status).toBe(200);
    expect((await signInWith(TENDAI.password)).status).toBe(401);
  });

  it("rejects a wrong current password and changes nothing, profile fields included", async () => {
    const cookie = await registerTendai();

    const response = await put(
      { ...profile, displayName: "Changed", currentPassword: "not my password", newPassword: NEW_PASSWORD },
      cookie,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ fieldErrors: { currentPassword: "Your current password is incorrect" } });
    expect((await signInWith(TENDAI.password)).status).toBe(200);
    expect((await (await getAccount(cookie)).json()).displayName).toBe("Tendai Mensah");
  });

  it("rejects a short new password and a new password without the current one", async () => {
    const cookie = await registerTendai();

    const short = await put({ ...profile, currentPassword: TENDAI.password, newPassword: "short" }, cookie);
    const missing = await put({ ...profile, newPassword: NEW_PASSWORD }, cookie);

    expect(short.status).toBe(400);
    expect((await short.json()).fieldErrors.newPassword).toBe("Use at least 12 characters");
    expect(missing.status).toBe(400);
    expect((await missing.json()).fieldErrors.currentPassword).toBe("Enter your current password");
    expect((await signInWith(TENDAI.password)).status).toBe(200);
  });
});

describe("DELETE /api/account", () => {
  async function remove(options?: { cookie?: string; origin?: string | null }) {
    const { DELETE } = await import("@/app/api/account/route");
    const { origin = APP_ORIGIN, cookie } = options ?? {};
    const headers: Record<string, string> = {};
    if (origin) headers.origin = origin;
    if (cookie) headers.cookie = cookie;
    return DELETE(new Request(`${APP_ORIGIN}/api/account`, { method: "DELETE", headers }));
  }

  async function signIn(password: string) {
    const { POST } = await import("@/app/api/auth/sign-in/route");
    return POST(postJson("/api/auth/sign-in", { email: TENDAI.email, password }));
  }

  it("deletes the member and every session, clears the cookie and answers 204", async () => {
    const cookie = await registerTendai();
    const other = sessionCookie(await signIn(TENDAI.password));

    const response = await remove({ cookie });

    expect(response.status).toBe(204);
    expect(sessionCookie(response).attributes).toContain("max-age=0");
    expect((await getAccount(cookie)).status).toBe(401);
    expect((await getAccount(`${other.name}=${other.value}`)).status).toBe(401);
    expect((await signIn(TENDAI.password)).status).toBe(401);
  });

  it("returns 401 without a session", async () => {
    expect((await remove()).status).toBe(401);
  });

  it("returns 403 without a same-origin Origin header and deletes nothing", async () => {
    const cookie = await registerTendai();

    expect((await remove({ cookie, origin: null })).status).toBe(403);
    expect((await remove({ cookie, origin: "http://evil.example" })).status).toBe(403);
    expect((await getAccount(cookie)).status).toBe(200);
  });
});
