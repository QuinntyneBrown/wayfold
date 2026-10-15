import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class HomePage {
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
}
