import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class SettingsPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open() {
    await this.page.goto("/settings");
  }

  get displayName() {
    return this.page.getByLabel("Display name");
  }

  get area() {
    return this.page.getByLabel("GTA area");
  }

  get homeChurch() {
    return this.page.getByLabel("Home church (optional)");
  }

  get showChurch() {
    return this.page.getByLabel("Show my home church to signed-in members");
  }

  get currentPassword() {
    return this.page.getByLabel("Current password");
  }

  get newPassword() {
    return this.page.getByLabel("New password");
  }

  get saveButton() {
    return this.page.getByRole("button", { name: "Save settings" });
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get savedNotice() {
    return this.page.getByRole("main").getByRole("status").filter({ hasText: "Saved" });
  }

  get alert() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get tryAgain() {
    return this.page.getByRole("button", { name: "Try again" });
  }

  async areaOptions() {
    return this.area.locator("option").allInnerTexts();
  }

  async save() {
    await this.saveButton.click();
  }
}
