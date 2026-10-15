import { expect, test } from "@playwright/test";
import { fakeApi, fakeNetworkFailure, fakeSession, PRIYA_POST, TENDAI, TENDAI_POST, type FeedPost } from "../pages/fake-api";
import { FeedPage } from "../pages/feed-page";

const FEED = { status: 200, json: { posts: [PRIYA_POST, TENDAI_POST] } };

test.describe("Feed", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
  });

  test("shows the member's feed with each post's author, topic, church and counts", async ({ page }) => {
    await fakeApi(page, "GET", "/api/feed", FEED);
    const feed = new FeedPage(page);

    await feed.open();

    await expect(feed.heading).toHaveText("Your feed");
    await expect(feed.posts).toHaveCount(2);
    await expect(feed.post(PRIYA_POST.text)).toContainText("Priya Nair");
    await expect(feed.post(PRIYA_POST.text)).toContainText("For sale");
    await expect(feed.post(PRIYA_POST.text)).toContainText("Etobicoke");
    await expect(feed.churchTag(PRIYA_POST.text)).toHaveText("Lakeshore Fellowship");
    await expect(feed.churchTag(TENDAI_POST.text)).toHaveCount(0);
    await expect(feed.likeButton(PRIYA_POST.text)).toHaveText("Like · 12");
    await expect(feed.post(PRIYA_POST.text)).toContainText("Beautiful car");
    expect(await feed.shell.accessibilityViolations()).toEqual([]);
  });

  test("renders HTML and script in a post as plain text", async ({ page }) => {
    const risky = { ...PRIYA_POST, id: "6f1d2c1e-0000-4000-8000-0000000000a3", text: "<img src=x onerror=alert(1)> <b>bold</b>" };
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [risky] } });
    const feed = new FeedPage(page);

    await feed.open();

    await expect(feed.post("<b>bold</b>")).toBeVisible();
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("shows a loading state, then the feed", async ({ page }) => {
    const api = await fakeApi(page, "GET", "/api/feed", FEED, { hold: true });
    const feed = new FeedPage(page);

    await feed.open();
    await expect(feed.loadingStatus).toBeVisible();
    api.release();

    await expect(feed.posts).toHaveCount(2);
    await expect(feed.loadingStatus).toHaveCount(0);
  });

  test("shows an empty message with the composer when there are no posts", async ({ page }) => {
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [] } });
    const feed = new FeedPage(page);

    await feed.open();

    await expect(feed.emptyMessage).toBeVisible();
    await expect(feed.postButton).toBeVisible();
  });

  test("offers Try again when the feed cannot be loaded", async ({ page }) => {
    await fakeApi(page, "GET", "/api/feed", { status: 500 });
    const feed = new FeedPage(page);
    await feed.open();
    await expect(feed.loadError).toContainText("Could not load this page");

    await page.unroute("**/api/feed");
    await fakeApi(page, "GET", "/api/feed", FEED);
    await feed.tryAgain.click();

    await expect(feed.posts).toHaveCount(2);
  });
});

test.describe("Feed: publishing", () => {
  const CREATED: FeedPost = { ...TENDAI_POST, id: "6f1d2c1e-0000-4000-8000-0000000000a9", topic: "Question", text: "Winter tire recommendations?", likes: 0, liked: false };

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", FEED);
  });

  test("publishes a post to the top of the feed and clears the composer", async ({ page }) => {
    const api = await fakeApi(page, "POST", "/api/posts", { status: 201, json: CREATED }, { hold: true });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.publish("Question", "Winter tire recommendations?");

    await expect(feed.postButton).toBeDisabled();
    await expect(feed.postButton).toHaveText("Posting…");
    api.release();

    await expect(feed.posts.first()).toContainText("Winter tire recommendations?");
    await expect(feed.postText).toHaveValue("");
    await expect(feed.toast).toContainText("Posted");
    expect(api.lastBody()).toEqual({ topic: "Question", text: "Winter tire recommendations?" });
  });

  test("shows the text error next to the composer and publishes nothing", async ({ page }) => {
    await fakeApi(page, "POST", "/api/posts", { status: 400, json: { fieldErrors: { text: "Write something to share" } } });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.postButton.click();

    await expect(feed.textError).toHaveText("Write something to share");
    await expect(feed.postText).toHaveAttribute("aria-invalid", "true");
    await expect(feed.posts).toHaveCount(2);
    expect(await feed.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows a danger toast and keeps the text when the server rejects the save", async ({ page }) => {
    await fakeApi(page, "POST", "/api/posts", { status: 500 });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.publish("My car", "Keep this text");

    await expect(feed.toast).toContainText("Could not save");
    await expect(feed.toast).toContainText("Please try again.");
    await expect(feed.postText).toHaveValue("Keep this text");
  });

  test("shows a warning toast and keeps the text when the connection drops", async ({ page }) => {
    await fakeNetworkFailure(page, "POST", "/api/posts");
    const feed = new FeedPage(page);
    await feed.open();

    await feed.publish("My car", "Keep this text");

    await expect(feed.toast).toContainText("Connection interrupted");
    await expect(feed.toast).toContainText("Your post is still here. Try again.");
    await expect(feed.postText).toHaveValue("Keep this text");
  });
});

test.describe("Feed: likes, comments and deleting", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", FEED);
  });

  test("likes a post, then removes the like", async ({ page }) => {
    const like = await fakeApi(page, "POST", `/api/posts/${PRIYA_POST.id}/like`, { status: 200, json: { liked: true, likes: 13 } });
    const feed = new FeedPage(page);
    await feed.open();
    await expect(feed.likeButton(PRIYA_POST.text)).toHaveAttribute("aria-pressed", "false");

    await feed.likeButton(PRIYA_POST.text).click();

    await expect(feed.likeButton(PRIYA_POST.text)).toHaveText("Like · 13");
    await expect(feed.likeButton(PRIYA_POST.text)).toHaveAttribute("aria-pressed", "true");

    await page.unroute(`**/api/posts/${PRIYA_POST.id}/like`);
    await fakeApi(page, "POST", `/api/posts/${PRIYA_POST.id}/like`, { status: 200, json: { liked: false, likes: 12 } });
    await feed.likeButton(PRIYA_POST.text).click();

    await expect(feed.likeButton(PRIYA_POST.text)).toHaveText("Like · 12");
    await expect(feed.likeButton(PRIYA_POST.text)).toHaveAttribute("aria-pressed", "false");
    expect(like.callCount()).toBe(1);
  });

  test("adds a comment under the post and clears the field", async ({ page }) => {
    const comment = {
      id: "6f1d2c1e-0000-4000-8000-0000000000b2",
      text: "Is it still available?",
      createdAt: "2026-10-15T10:00:00.000Z",
      author: { id: TENDAI.id, displayName: "Tendai Mensah" },
    };
    const api = await fakeApi(page, "POST", `/api/posts/${PRIYA_POST.id}/comments`, { status: 201, json: comment });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.commentField(PRIYA_POST.text).fill("Is it still available?");
    await feed.commentButton(PRIYA_POST.text).click();

    await expect(feed.post(PRIYA_POST.text)).toContainText("Tendai Mensah: Is it still available?");
    await expect(feed.commentField(PRIYA_POST.text)).toHaveValue("");
    expect(api.lastBody()).toEqual({ text: "Is it still available?" });
  });

  test("shows a comment error next to the comment field", async ({ page }) => {
    await fakeApi(page, "POST", `/api/posts/${PRIYA_POST.id}/comments`, { status: 400, json: { fieldErrors: { text: "Write a comment" } } });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.commentButton(PRIYA_POST.text).click();

    await expect(feed.post(PRIYA_POST.text).getByText("Write a comment", { exact: true })).toBeVisible();
    await expect(feed.commentField(PRIYA_POST.text)).toHaveAttribute("aria-invalid", "true");
  });

  test("offers Delete only on the member's own posts, and deleting removes the post", async ({ page }) => {
    const del = await fakeApi(page, "DELETE", `/api/posts/${TENDAI_POST.id}`, { status: 204 });
    const feed = new FeedPage(page);
    await feed.open();
    await expect(feed.deleteButton(PRIYA_POST.text)).toHaveCount(0);

    await feed.deleteButton(TENDAI_POST.text).click();

    await expect(feed.post(TENDAI_POST.text)).toHaveCount(0);
    await expect(feed.posts).toHaveCount(1);
    expect(del.callCount()).toBe(1);
  });

  test("keeps the post and shows a toast when deleting fails", async ({ page }) => {
    await fakeApi(page, "DELETE", `/api/posts/${TENDAI_POST.id}`, { status: 500 });
    const feed = new FeedPage(page);
    await feed.open();

    await feed.deleteButton(TENDAI_POST.text).click();

    await expect(feed.toast).toContainText("Could not save");
    await expect(feed.post(TENDAI_POST.text)).toBeVisible();
  });
});

test.describe("Home for a visitor", () => {
  test("shows the public landing page and never requests the feed", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, null);
    const feedApi = await fakeApi(page, "GET", "/api/feed", { status: 401 });
    const feed = new FeedPage(page);

    await feed.open();

    await expect(feed.heading).toHaveText("Find your people in the GTA auto community");
    await expect(feed.composer).toHaveCount(0);
    expect(feedApi.callCount()).toBe(0);
  });
});
