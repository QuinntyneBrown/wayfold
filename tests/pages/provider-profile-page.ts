import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class ProviderProfilePage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open(id: string) {
    await this.page.goto(`/providers/${id}`);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get summary() {
    return this.page.getByRole("main").locator(".page-head p");
  }

  get description() {
    return this.page.getByText("Honest repairs and clear explanations for Toronto drivers.");
  }

  get ownerChurch() {
    return this.page.getByRole("main").locator(".church-tag");
  }

  get callLink() {
    return this.page.getByRole("link", { name: /^Call / });
  }

  get emailLink() {
    return this.page.getByRole("link", { name: "Email" });
  }

  get recommendations() {
    return this.page.getByRole("region", { name: "Member recommendations" });
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

  get notFoundHeading() {
    return this.page.getByRole("heading", { name: "Page not found" });
  }

  async hasHorizontalScroll() {
    return this.shell.scrollsHorizontally();
  }
}
