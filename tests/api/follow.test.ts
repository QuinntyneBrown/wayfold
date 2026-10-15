import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/members/[id]/route";
import { DELETE, POST } from "@/app/api/members/[id]/follow/route";
import { registerMember, withId } from "./requests";

const follow = (id: string, cookie?: string, origin?: string | null) =>
  POST(...withId(id, `/api/members/${id}/follow`, { method: "POST", cookie, origin }));
const unfollow = (id: string, cookie?: string) =>
  DELETE(...withId(id, `/api/members/${id}/follow`, { method: "DELETE", cookie }));
const profile = async (id: string, cookie: string) => (await GET(...withId(id, `/api/members/${id}`, { cookie }))).json();

async function twoMembers() {
  return { tendai: await registerMember("Tendai Mensah", "tendai@example.com"), priya: await registerMember("Priya Nair", "priya@example.com") };
}

describe("POST and DELETE /api/members/:id/follow", () => {
  it("follows a member, raising the follower count by 1, and unfollows, lowering it by 1", async () => {
    const { tendai, priya } = await twoMembers();

    const followed = await follow(priya.id, tendai.cookie);

    expect(followed.status).toBe(200);
    expect(await followed.json()).toEqual({ followers: 1 });
    expect(await profile(priya.id, tendai.cookie)).toMatchObject({ followers: 1, following: true });

    const unfollowed = await unfollow(priya.id, tendai.cookie);

    expect(unfollowed.status).toBe(200);
    expect(await unfollowed.json()).toEqual({ followers: 0 });
    expect(await profile(priya.id, tendai.cookie)).toMatchObject({ followers: 0, following: false });
  });

  it("does not create a second follow when repeated", async () => {
    const { tendai, priya } = await twoMembers();

    await follow(priya.id, tendai.cookie);
    const again = await follow(priya.id, tendai.cookie);

    expect(await again.json()).toEqual({ followers: 1 });
  });

  it("counts followers from different members", async () => {
    const { tendai, priya } = await twoMembers();
    const samuel = await registerMember("Samuel Adeyemi", "samuel@example.com");

    await follow(priya.id, tendai.cookie);
    const response = await follow(priya.id, samuel.cookie);

    expect(await response.json()).toEqual({ followers: 2 });
  });

  it("rejects following oneself with 400", async () => {
    const { tendai } = await twoMembers();

    expect((await follow(tendai.id, tendai.cookie)).status).toBe(400);
    expect((await profile(tendai.id, tendai.cookie)).followers).toBe(0);
  });

  it("returns 404 for an unknown member", async () => {
    const { tendai } = await twoMembers();

    expect((await follow("6f1d2c1e-0000-4000-8000-0000000000ff", tendai.cookie)).status).toBe(404);
    expect((await follow("not-an-id", tendai.cookie)).status).toBe(404);
  });

  it("returns 401 without a session and 403 without a same-origin Origin", async () => {
    const { tendai, priya } = await twoMembers();

    expect((await follow(priya.id)).status).toBe(401);
    expect((await unfollow(priya.id)).status).toBe(401);
    expect((await follow(priya.id, tendai.cookie, null)).status).toBe(403);
    expect((await profile(priya.id, tendai.cookie)).followers).toBe(0);
  });
});
