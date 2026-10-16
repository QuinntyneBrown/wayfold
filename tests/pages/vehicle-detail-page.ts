import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class VehicleDetailPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open(id: string) {
    await this.page.goto(`/vehicles/${id}`);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get summary() {
    return this.page.getByRole("main").locator(".page-head p");
  }

  get photo() {
    return this.page.getByRole("main").getByRole("img");
  }

  get details() {
    return this.page.getByRole("region", { name: "Vehicle details" });
  }

  get sellerPanel() {
    return this.page.getByRole("complementary");
  }

  get dealerProfileLink() {
    return this.sellerPanel.getByRole("link", { name: "View dealer profile" });
  }

  get homeChurch() {
    return this.sellerPanel.locator(".church-tag");
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

  get soldNotice() {
    return this.sellerPanel.getByText("This vehicle is no longer available.");
  }
}
