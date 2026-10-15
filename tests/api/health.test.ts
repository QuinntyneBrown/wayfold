import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { healthResponse } from "@/lib/health";

describe("health", () => {
  it("returns 200 when the database answers", async () => {
    const response = await GET(new Request("http://localhost:3000/api/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns 503 with no internal detail when a dependency fails", async () => {
    const response = await healthResponse(async () => {
      throw new Error("connect ECONNREFUSED 10.0.0.5:5432");
    });

    expect(response.status).toBe(503);
    expect(await response.text()).toBe(JSON.stringify({ status: "unavailable" }));
  });
});
