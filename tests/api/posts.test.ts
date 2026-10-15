import { describe, expect, it } from "vitest";
import { GET as getFeed } from "@/app/api/feed/route";
import { POST as follow } from "@/app/api/members/[id]/follow/route";
import { GET as getMember } from "@/app/api/members/[id]/route";
import { POST as comment } from "@/app/api/posts/[id]/comments/route";
import { POST as like } from "@/app/api/posts/[id]/like/route";
import { DELETE } from "@/app/api/posts/[id]/route";
import { POST as publish } from "@/app/api/posts/route";
import { PUT as saveAccount } from "@/app/api/account/route";
import { APP_ORIGIN, postJson, registerMember, withId, type TestMember } from "./requests";

type FeedPost = {
  id: string;
  topic: string;
  text: string;
  likes: number;
  liked: boolean;
  mine: boolean;
  author: Record<string, unknown>;
  comments: { text: string }[];
};

const post = (body: unknown, cookie?: string, origin?: string | null) => publish(postJson("/api/posts", body, { cookie, origin }));
const remove = (id: string, cookie?: string) => DELETE(...withId(id, `/api/posts/${id}`, { method: "DELETE", cookie }));
const likePost = (id: string, cookie?: string, origin?: string | null) =>
  like(...withId(id, `/api/posts/${id}/like`, { method: "POST", cookie, origin }));
const commentOn = (id: string, body: unknown, cookie?: string) =>
  comment(...withId(id, `/api/posts/${id}/comments`, { method: "POST", body, cookie }));
const feed = async (cookie?: string) => getFeed(new Request(`${APP_ORIGIN}/api/feed`, { headers: cookie ? { cookie } : {} }));
const feedPosts = async (cookie: string) => (await (await feed(cookie)).json()).posts as FeedPost[];
const followMember = (id: string, cookie: string) => follow(...withId(id, `/api/members/${id}/follow`, { method: "POST", cookie }));

async function members() {
  const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
  const priya = await registerMember("Priya Nair", "priya@example.com");
  const samuel = await registerMember("Samuel Adeyemi", "samuel@example.com");
  return { tendai, priya, samuel };
}

async function newPost(member: TestMember, text = "Bluebird made it through another winter", topic = "My car") {
  const response = await post({ topic, text }, member.cookie);
  return (await response.json()) as { id: string };
}

describe("POST /api/posts", () => {
  it("publishes a post that appears at the top of the author's feed", async () => {
    const { tendai } = await members();
    await newPost(tendai, "First");

    const response = await post({ topic: "Question", text: "Winter tire recommendations?" }, tendai.cookie);

    expect(response.status).toBe(201);
    const [latest, earlier] = await feedPosts(tendai.cookie);
    expect(latest).toMatchObject({
      topic: "Question",
      text: "Winter tire recommendations?",
      likes: 0,
      liked: false,
      comments: [],
      mine: true,
      author: { id: tendai.id, displayName: "Tendai Mensah" },
    });
    expect(earlier.text).toBe("First");
  });

  it("accepts 1 and 1000 characters and each of the four topics", async () => {
    const { tendai } = await members();

    for (const topic of ["My car", "Question", "Recommendation", "For sale"]) {
      expect((await post({ topic, text: "x" }, tendai.cookie)).status).toBe(201);
    }
    expect((await post({ topic: "My car", text: "x".repeat(1000) }, tendai.cookie)).status).toBe(201);
  });

  it("rejects empty text, text over 1000 characters and a missing or unknown topic, publishing nothing", async () => {
    const { tendai } = await members();

    const empty = await post({ topic: "My car", text: "   " }, tendai.cookie);
    const long = await post({ topic: "My car", text: "x".repeat(1001) }, tendai.cookie);
    const noTopic = await post({ text: "Hello" }, tendai.cookie);
    const badTopic = await post({ topic: "Politics", text: "Hello" }, tendai.cookie);

    expect(empty.status).toBe(400);
    expect((await empty.json()).fieldErrors.text).toBe("Write something to share");
    expect((await long.json()).fieldErrors.text).toBe("Use 1000 characters or fewer");
    expect((await noTopic.json()).fieldErrors.topic).toBe("Choose a topic");
    expect(badTopic.status).toBe(400);
    expect(await feedPosts(tendai.cookie)).toEqual([]);
  });

  it("stores HTML and script text unchanged, to be rendered as escaped text", async () => {
    const { tendai } = await members();
    const text = "<script>alert(1)</script> <b>bold</b>";

    await post({ topic: "My car", text }, tendai.cookie);

    expect((await feedPosts(tendai.cookie))[0].text).toBe(text);
  });

  it("returns 401 without a session and 403 without a same-origin Origin", async () => {
    const { tendai } = await members();

    expect((await post({ topic: "My car", text: "Hi" })).status).toBe(401);
    expect((await post({ topic: "My car", text: "Hi" }, tendai.cookie, null)).status).toBe(403);
    expect(await feedPosts(tendai.cookie)).toEqual([]);
  });
});

describe("GET /api/feed", () => {
  it("shows the member's own posts and followed members' posts, newest first, and nobody else's", async () => {
    const { tendai, priya, samuel } = await members();
    await followMember(priya.id, tendai.cookie);
    await newPost(priya, "Priya first");
    await newPost(samuel, "Samuel is not followed");
    await newPost(tendai, "Tendai second");
    await newPost(priya, "Priya third");

    const posts = await feedPosts(tendai.cookie);

    expect(posts.map((p) => p.text)).toEqual(["Priya third", "Tendai second", "Priya first"]);
    expect(posts.map((p) => p.mine)).toEqual([false, true, false]);
  });

  it("shows the author's church only when they opted in", async () => {
    const { tendai, priya } = await members();
    await followMember(priya.id, tendai.cookie);
    const share = (showHomeChurch: boolean) =>
      saveAccount(postJson("/api/account", { displayName: "Priya Nair", gtaArea: "Etobicoke", homeChurch: "Lakeshore Fellowship", showHomeChurch }, { cookie: priya.cookie }, "PUT"));
    await newPost(priya);

    await share(true);
    expect((await feedPosts(tendai.cookie))[0].author).toMatchObject({ homeChurch: "Lakeshore Fellowship", gtaArea: "Etobicoke" });

    await share(false);
    expect((await feedPosts(tendai.cookie))[0].author).not.toHaveProperty("homeChurch");
  });

  it("never returns an email address", async () => {
    const { tendai } = await members();
    await newPost(tendai);

    expect(JSON.stringify(await feedPosts(tendai.cookie))).not.toContain("@example.com");
  });

  it("returns 401 and no data to a visitor", async () => {
    const response = await feed();

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("");
  });
});

describe("DELETE /api/posts/:id", () => {
  it("lets the author delete a post, which disappears from every feed", async () => {
    const { tendai, priya } = await members();
    await followMember(priya.id, tendai.cookie);
    const { id } = await newPost(priya);
    expect(await feedPosts(tendai.cookie)).toHaveLength(1);

    const response = await remove(id, priya.cookie);

    expect(response.status).toBe(204);
    expect(await feedPosts(tendai.cookie)).toEqual([]);
    expect(await feedPosts(priya.cookie)).toEqual([]);
  });

  it("answers 403 to another member and 404 to an unknown post, deleting nothing", async () => {
    const { tendai, priya } = await members();
    const { id } = await newPost(priya);

    expect((await remove(id, tendai.cookie)).status).toBe(403);
    expect((await remove("6f1d2c1e-0000-4000-8000-0000000000ff", tendai.cookie)).status).toBe(404);
    expect((await remove("not-an-id", tendai.cookie)).status).toBe(404);
    expect((await remove(id)).status).toBe(401);
    expect(await feedPosts(priya.cookie)).toHaveLength(1);
  });
});

describe("POST /api/posts/:id/like", () => {
  it("likes a post, then removes the like when liked again", async () => {
    const { tendai, priya } = await members();
    await followMember(priya.id, tendai.cookie);
    const { id } = await newPost(priya);

    const liked = await likePost(id, tendai.cookie);
    expect(await liked.json()).toEqual({ liked: true, likes: 1 });
    expect((await feedPosts(tendai.cookie))[0]).toMatchObject({ likes: 1, liked: true });
    expect((await feedPosts(priya.cookie))[0]).toMatchObject({ likes: 1, liked: false });

    const unliked = await likePost(id, tendai.cookie);
    expect(await unliked.json()).toEqual({ liked: false, likes: 0 });
  });

  it("counts likes from different members", async () => {
    const { tendai, priya } = await members();
    const { id } = await newPost(priya);

    await likePost(id, tendai.cookie);
    const response = await likePost(id, priya.cookie);

    expect(await response.json()).toEqual({ liked: true, likes: 2 });
  });

  it("answers 404 for an unknown post, 401 without a session and 403 cross-origin", async () => {
    const { tendai, priya } = await members();
    const { id } = await newPost(priya);

    expect((await likePost("6f1d2c1e-0000-4000-8000-0000000000ff", tendai.cookie)).status).toBe(404);
    expect((await likePost(id)).status).toBe(401);
    expect((await likePost(id, tendai.cookie, null)).status).toBe(403);
  });
});

describe("POST /api/posts/:id/comments", () => {
  it("adds a comment that appears under the post, oldest first", async () => {
    const { tendai, priya } = await members();
    await followMember(priya.id, tendai.cookie);
    const { id } = await newPost(priya);

    const response = await commentOn(id, { text: "Great car" }, tendai.cookie);
    await commentOn(id, { text: "Agreed" }, priya.cookie);

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ text: "Great car", author: { id: tendai.id, displayName: "Tendai Mensah" } });
    const [item] = await feedPosts(tendai.cookie);
    expect(item.comments.map((c) => c.text)).toEqual(["Great car", "Agreed"]);
  });

  it("accepts 500 characters and rejects empty or longer text, adding nothing", async () => {
    const { tendai, priya } = await members();
    const { id } = await newPost(priya);

    expect((await commentOn(id, { text: "x".repeat(500) }, tendai.cookie)).status).toBe(201);
    const empty = await commentOn(id, { text: " " }, tendai.cookie);
    const long = await commentOn(id, { text: "x".repeat(501) }, tendai.cookie);

    expect(empty.status).toBe(400);
    expect((await empty.json()).fieldErrors.text).toBe("Write a comment");
    expect((await long.json()).fieldErrors.text).toBe("Use 500 characters or fewer");
    expect((await feedPosts(priya.cookie))[0].comments).toHaveLength(1);
  });

  it("answers 404 for an unknown post and 401 without a session", async () => {
    const { tendai, priya } = await members();
    const { id } = await newPost(priya);

    expect((await commentOn("6f1d2c1e-0000-4000-8000-0000000000ff", { text: "Hi" }, tendai.cookie)).status).toBe(404);
    expect((await commentOn(id, { text: "Hi" })).status).toBe(401);
  });
});

describe("GET /api/members/:id posts", () => {
  it("lists the member's own posts, newest first, on their profile", async () => {
    const { tendai, priya } = await members();
    await newPost(priya, "One");
    await newPost(priya, "Two");
    await newPost(tendai, "Not Priya's");

    const profile = await (await getMember(...withId(priya.id, `/api/members/${priya.id}`, { cookie: tendai.cookie }))).json();

    expect(profile.posts.map((p: { text: string }) => p.text)).toEqual(["Two", "One"]);
    expect(profile.posts[0]).toMatchObject({ mine: false, author: { id: priya.id } });
  });
});
