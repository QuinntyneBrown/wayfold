import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class FeedPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open() {
    await this.page.goto("/");
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get loadError() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get tryAgain() {
    return this.page.getByRole("button", { name: "Try again" });
  }

  get emptyMessage() {
    return this.page.getByRole("heading", { name: "Nothing here yet" });
  }

  get topic() {
    return this.composer.getByLabel("Auto topic");
  }

  get composer() {
    return this.page.getByRole("form", { name: "Share with your community" });
  }

  get postText() {
    return this.composer.getByLabel("What would you like to share?");
  }

  get postButton() {
    return this.composer.getByRole("button", { name: /^(Post to feed|Posting…)$/ });
  }

  get textError() {
    return this.composer.locator(".field__error");
  }

  get toast() {
    return this.page.locator(".toast-region .toast");
  }

  get posts() {
    return this.page.getByRole("region", { name: "Latest posts" }).getByRole("article");
  }

  post(text: string) {
    return this.posts.filter({ hasText: text });
  }

  likeButton(text: string) {
    return this.post(text).getByRole("button", { name: /^Like/ });
  }

  commentField(text: string) {
    return this.post(text).getByLabel("Add a comment (up to 500 characters)");
  }

  commentButton(text: string) {
    return this.post(text).getByRole("button", { name: /^(Comment|Sending…)$/ });
  }

  deleteButton(text: string) {
    return this.post(text).getByRole("button", { name: "Delete post" });
  }

  churchTag(text: string) {
    return this.post(text).locator(".church-tag");
  }

  async publish(topic: string, text: string) {
    await this.topic.selectOption(topic);
    await this.postText.fill(text);
    await this.postButton.click();
  }
}
