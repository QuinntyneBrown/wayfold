import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/sign-in/route";
import { db } from "@/lib/db/client";
import { failedSignIns, users } from "@/lib/db/schema";
import { postJson, registerTendai, TENDAI } from "./requests";

const MINUTE = 60 * 1000;

function signIn(password: string) {
  return POST(postJson("/api/auth/sign-in", { email: TENDAI.email, password }));
}

async function failTimes(count: number) {
  for (let i = 0; i < count; i++) expect((await signIn("not the password")).status).toBe(401);
}

describe("sign-in lockout", () => {
  it("blocks the sixth attempt after 5 failures within 15 minutes, even with the correct password", async () => {
    await registerTendai();
    await failTimes(5);

    const response = await signIn(TENDAI.password);

    expect(response.status).toBe(429);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("still lets the member in after only 4 failures", async () => {
    await registerTendai();
    await failTimes(4);

    expect((await signIn(TENDAI.password)).status).toBe(200);
  });

  it("lets the member in again once the failures are older than 15 minutes", async () => {
    await registerTendai();
    const [user] = await db.select().from(users);
    const longAgo = new Date(Date.now() - 16 * MINUTE);
    await db.insert(failedSignIns).values(Array.from({ length: 5 }, () => ({ userId: user.id, attemptedAt: longAgo })));

    expect((await signIn(TENDAI.password)).status).toBe(200);
  });
});
