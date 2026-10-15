import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class MemberProfilePage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open(id: string, hash = "") {
    await this.page.goto(`/members/${id}${hash}`);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get header() {
    return this.page.getByRole("region", { name: "Member" });
  }

  get churchTag() {
    return this.page.locator(".church-tag");
  }

  section(name: string) {
    return this.page.getByRole("navigation", { name: "Profile sections" }).getByRole("button", { name });
  }

  get sectionContent() {
    return this.page.getByRole("region", { name: "Profile content" });
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

  get editProfileButton() {
    return this.page.getByRole("main").getByRole("button", { name: "Edit profile" });
  }

  get editProfileDialog() {
    return this.page.getByRole("dialog", { name: "Edit your profile" });
  }

  get bioField() {
    return this.editProfileDialog.getByLabel("Bio (optional)");
  }

  get saveProfile() {
    return this.editProfileDialog.getByRole("button", { name: /^(Save profile|Saving…)$/ });
  }

  get cancelEditProfile() {
    return this.editProfileDialog.getByRole("button", { name: "Cancel" });
  }

  get editProfileAlert() {
    return this.editProfileDialog.getByRole("alert");
  }

  get followButton() {
    return this.page.getByRole("main").getByRole("button", { name: /^(Follow |Following)/ });
  }

  get toast() {
    return this.page.locator(".toast-region .toast");
  }
}
