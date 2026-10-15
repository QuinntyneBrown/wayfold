import type { Page, Response } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class NotFoundPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open(path: string): Promise<Response | null> {
    return this.page.goto(path);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get message() {
    return this.page.getByText("That page isn't here.");
  }

  get goHomeLink() {
    return this.page.getByRole("link", { name: "Go home" });
  }
}
