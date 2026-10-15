import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/account/route";
import { APP_ORIGIN, postJson, registerTendai } from "./requests";

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
