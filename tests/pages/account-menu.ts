import type { Page } from "@playwright/test";

/** The account menu popover opened from the avatar button at 768 px and wider. */
export class AccountMenu {
  constructor(
    private readonly page: Page,
    private readonly memberName: string,
  ) {}

  get avatarButton() {
    return this.page.getByRole("button", { name: `Account menu for ${this.memberName}` });
  }

  get dialog() {
    return this.page.getByRole("dialog", { name: this.memberName });
  }

  async openWithKeyboard() {
    await this.avatarButton.focus();
    await this.page.keyboard.press("Enter");
  }

  /** Signs out and waits for the home page to reload. */
  async signOut() {
    await Promise.all([
      this.page.waitForEvent("load"),
      this.dialog.getByRole("button", { name: "Sign out" }).click(),
    ]);
  }

  async closeWithEscape() {
    await this.page.keyboard.press("Escape");
  }

  async items() {
    return this.dialog.getByRole("list", { name: "Account" }).locator("a, button").allInnerTexts();
  }
}
