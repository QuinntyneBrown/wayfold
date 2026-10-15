import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { postJson, sessionCookie } from "./requests";

const VALID = { displayName: "Tendai Mensah", email: "Tendai@Example.com", password: "correct horse battery" };

describe("POST /api/auth/register", () => {
  it("creates the account with a salted adaptive hash and signs the member in", async () => {
    const response = await POST(postJson("/api/auth/register", VALID));

    expect(response.status).toBe(201);
    const [user] = await db.select().from(users);
    expect(user.email).toBe("tendai@example.com");
    expect(user.displayName).toBe("Tendai Mensah");
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user.passwordHash).not.toContain(VALID.password);

    const cookie = sessionCookie(response);
    expect(cookie.name).toBe("wayfold_session");
    expect(cookie.attributes).toEqual(expect.arrayContaining(["httponly", "secure", "samesite=lax", "path=/"]));
    const [session] = await db.select().from(sessions).where(eq(sessions.userId, user.id));
    expect(session.id).toBe(createHash("sha256").update(cookie.value).digest("hex"));
    expect(session.invalidatedAt).toBeNull();
  });

  it("rejects an email that is already registered, in any letter case, without creating a second account", async () => {
    await POST(postJson("/api/auth/register", VALID));

    const response = await POST(
      postJson("/api/auth/register", { ...VALID, displayName: "Someone Else", email: "TENDAI@example.com" }),
    );

    expect(response.status).toBe(409);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it("returns field errors and creates nothing for a missing name, invalid email and short password", async () => {
    const response = await POST(
      postJson("/api/auth/register", { displayName: "  ", email: "not-an-email", password: "elevenchars" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      fieldErrors: {
        displayName: "Enter your name",
        email: "Enter a valid email",
        password: "Use at least 12 characters",
      },
    });
    expect(await db.select().from(users)).toHaveLength(0);
  });

  it.each([
    ["missing", null],
    ["foreign", "https://evil.example"],
  ])("rejects a request with a %s Origin header", async (_label, origin) => {
    const response = await POST(postJson("/api/auth/register", VALID, { origin }));

    expect(response.status).toBe(403);
    expect(await db.select().from(users)).toHaveLength(0);
  });
});
