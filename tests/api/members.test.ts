import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/members/[id]/route";
import { PATCH } from "@/app/api/members/me/route";
import { PUT } from "@/app/api/account/route";
import { postJson, registerMember, withId } from "./requests";

const getMember = (id: string, cookie?: string) => GET(...withId(id, `/api/members/${id}`, { cookie }));

async function shareChurch(cookie: string, showHomeChurch: boolean) {
  await PUT(
    postJson("/api/account", { displayName: "Priya Nair", gtaArea: "Etobicoke", homeChurch: "Lakeshore Fellowship", showHomeChurch }, { cookie }, "PUT"),
  );
}

describe("GET /api/members/:id", () => {
  it("returns 401 to a visitor and no profile data", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");

    const response = await getMember(priya.id);

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("");
  });

  it("returns 404 for an unknown or malformed id", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    expect((await getMember("6f1d2c1e-0000-4000-8000-0000000000ff", tendai.cookie)).status).toBe(404);
    expect((await getMember("not-an-id", tendai.cookie)).status).toBe(404);
  });

  it("shows another member's public profile without the email", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const priya = await registerMember("Priya Nair", "priya@example.com");
    await shareChurch(priya.cookie, false);

    const response = await getMember(priya.id, tendai.cookie);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: priya.id,
      displayName: "Priya Nair",
      gtaArea: "Etobicoke",
      bio: null,
      followers: 0,
      following: false,
      isOwner: false,
      garage: [],
      posts: [],
      listings: [],
      recommendations: [],
    });
  });

  it("shows the church to a signed-in viewer only when the member opted in", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const priya = await registerMember("Priya Nair", "priya@example.com");

    await shareChurch(priya.cookie, true);
    expect((await (await getMember(priya.id, tendai.cookie)).json()).homeChurch).toBe("Lakeshore Fellowship");

    await shareChurch(priya.cookie, false);
    expect(await (await getMember(priya.id, tendai.cookie)).json()).not.toHaveProperty("homeChurch");
  });

  it("marks the member's own profile", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");

    expect((await (await getMember(priya.id, priya.cookie)).json()).isOwner).toBe(true);
  });
});

describe("PATCH /api/members/me", () => {
  const patch = (body: unknown, options?: { cookie?: string; origin?: string | null }) =>
    PATCH(postJson("/api/members/me", body, options, "PATCH"));

  it("saves a bio of 500 characters and shows it on the profile", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const bio = "a".repeat(500);

    const response = await patch({ bio }, { cookie: priya.cookie });

    expect(response.status).toBe(200);
    expect((await (await getMember(priya.id, priya.cookie)).json()).bio).toBe(bio);
  });

  it("rejects a bio over 500 characters and saves nothing", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    await patch({ bio: "Hello" }, { cookie: priya.cookie });

    const response = await patch({ bio: "a".repeat(501) }, { cookie: priya.cookie });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ fieldErrors: { bio: "Use 500 characters or fewer" } });
    expect((await (await getMember(priya.id, priya.cookie)).json()).bio).toBe("Hello");
  });

  it("stores an empty bio as null", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");
    await patch({ bio: "Hello" }, { cookie: priya.cookie });

    await patch({ bio: "  " }, { cookie: priya.cookie });

    expect((await (await getMember(priya.id, priya.cookie)).json()).bio).toBeNull();
  });

  it("returns 401 without a session and 403 without a same-origin Origin", async () => {
    const priya = await registerMember("Priya Nair", "priya@example.com");

    expect((await patch({ bio: "x" })).status).toBe(401);
    expect((await patch({ bio: "x" }, { cookie: priya.cookie, origin: null })).status).toBe(403);
  });
});

