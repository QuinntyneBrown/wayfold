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

  get messageSeller() {
    return this.sellerPanel.getByRole("link", { name: "Message seller" }).or(this.sellerPanel.getByRole("button", { name: "Message seller" }));
  }

  get messageSellerLink() {
    return this.sellerPanel.getByRole("link", { name: "Message seller" });
  }

  get messageSellerButton() {
    return this.sellerPanel.getByRole("button", { name: "Message seller" });
  }

  get messageDialog() {
    return this.page.getByRole("dialog", { name: "Message the seller" });
  }

  get message() {
    return this.messageDialog.getByLabel("Your message (up to 2000 characters)");
  }

  get sendButton() {
    return this.messageDialog.getByRole("button", { name: /^(Send message|Sending…)$/ });
  }

  get cancelButton() {
    return this.messageDialog.getByRole("button", { name: "Cancel" });
  }

  get doneButton() {
    return this.messageDialog.getByRole("button", { name: "Done" });
  }

  get dialogAlert() {
    return this.messageDialog.getByRole("alert");
  }

  get sentConfirmation() {
    return this.messageDialog.getByRole("status").filter({ hasText: "Posted" });
  }

  async openMessageDialog() {
    await this.messageSellerButton.click();
  }

  async hasHorizontalScroll() {
    return this.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  }
}
