import type { Page } from "@playwright/test";

/** The site menu dialog opened by the Menu control below 768 px. */
export class SiteMenu {
  constructor(private readonly page: Page) {}

  get menuControl() {
    return this.page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Menu" });
  }

  get dialog() {
    return this.page.getByRole("dialog", { name: "Menu" });
  }

  async openWithKeyboard() {
    await this.menuControl.focus();
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

  async destinations() {
    return this.dialog.getByRole("navigation", { name: "Main" }).locator("a, button").allInnerTexts();
  }

  async containsFocus() {
    return this.dialog.evaluate((dialog) => dialog.contains(document.activeElement));
  }
}
