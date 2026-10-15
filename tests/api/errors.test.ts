import { afterEach, describe, expect, it, vi } from "vitest";
import { redact } from "@/lib/logger";
import { withErrorHandling } from "@/lib/with-error-handling";

afterEach(() => vi.restoreAllMocks());

function captureLogs() {
  const lines: string[] = [];
  vi.spyOn(console, "log").mockImplementation((line: string) => void lines.push(line));
  vi.spyOn(console, "error").mockImplementation((line: string) => void lines.push(line));
  return () => lines.map((l) => JSON.parse(l));
}

const boom = withErrorHandling("/api/boom", async () => {
  throw new Error("secret internal detail at /srv/app.ts:12");
});

describe("withErrorHandling", () => {
  it("returns a generic 500 and logs one structured entry with the request id", async () => {
    const logs = captureLogs();

    const response = await boom(new Request("http://localhost:3000/api/boom", { headers: { "x-request-id": "req-123" } }));

    expect(response.status).toBe(500);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ error: "Something went wrong", requestId: "req-123" });
    expect(text).not.toContain("secret");
    const entries = logs();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ level: "error", requestId: "req-123", route: "/api/boom", status: 500 });
    expect(entries[0].timestamp).toEqual(expect.any(String));
  });

  it("generates a request id when none is sent", async () => {
    captureLogs();

    const response = await boom(new Request("http://localhost:3000/api/boom"));

    expect((await response.json()).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("passes a normal response through with the request id header", async () => {
    const ok = withErrorHandling("/api/ok", async () => new Response("fine"));

    const response = await ok(new Request("http://localhost:3000/api/ok", { headers: { "x-request-id": "abc" } }));

    expect(await response.text()).toBe("fine");
    expect(response.headers.get("x-request-id")).toBe("abc");
  });
});

describe("redact", () => {
  it("blanks passwords, tokens and cookies", () => {
    expect(redact({ event: "x", password: "p", sessionToken: "t", cookie: "c", status: 200 })).toEqual({
      event: "x",
      password: "[redacted]",
      sessionToken: "[redacted]",
      cookie: "[redacted]",
      status: 200,
    });
  });
});
