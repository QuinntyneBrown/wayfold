import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/account/route";
import { APP_ORIGIN, registerTendai } from "./requests";

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
