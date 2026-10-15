import type { Page } from "@playwright/test";

export class ServerErrorPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get message() {
    return this.page.getByText("We couldn't load the page. Please try again.");
  }

  get goHomeLink() {
    return this.page.getByRole("link", { name: "Go home" });
  }
}
