import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/sign-in/route";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { postJson, registerTendai, sessionCookie, TENDAI } from "./requests";

function signIn(body: unknown, options?: { origin?: string | null }) {
  return POST(postJson("/api/auth/sign-in", body, options));
}

describe("POST /api/auth/sign-in", () => {
  it("starts a new session for correct credentials, ignoring email letter case", async () => {
    await registerTendai();

    const response = await signIn({ email: "TENDAI@example.com", password: TENDAI.password });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ displayName: TENDAI.displayName });
    const cookie = sessionCookie(response);
    expect(cookie.name).toBe("wayfold_session");
    expect(cookie.attributes).toEqual(expect.arrayContaining(["httponly", "secure", "samesite=lax", "path=/"]));
    const ids = (await db.select().from(sessions)).map((s) => s.id);
    expect(ids).toContain(createHash("sha256").update(cookie.value).digest("hex"));
  });

  it("answers a wrong password and an unknown email with the same generic 401", async () => {
    await registerTendai();

    const wrongPassword = await signIn({ email: TENDAI.email, password: "not the password" });
    const unknownEmail = await signIn({ email: "nobody@example.com", password: TENDAI.password });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(await wrongPassword.text()).toBe(await unknownEmail.text());
    expect(wrongPassword.headers.get("set-cookie")).toBeNull();
    expect(unknownEmail.headers.get("set-cookie")).toBeNull();
  });

  it("returns field errors for an invalid email and an empty password", async () => {
    const response = await signIn({ email: "not-an-email", password: "" });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      fieldErrors: { email: "Enter a valid email", password: "Enter your password" },
    });
  });

  it("rejects a request without a same-origin Origin header", async () => {
    await registerTendai();

    const response = await signIn({ email: TENDAI.email, password: TENDAI.password }, { origin: null });

    expect(response.status).toBe(403);
  });
});
