import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

/** The header, footer and skip link that frame every screen. */
export class SiteShell {
  constructor(private readonly page: Page) {}

  get skipLink() {
    return this.page.getByRole("link", { name: "Skip to content" });
  }

  get main() {
    return this.page.getByRole("main");
  }

  async primaryNavItems() {
    return this.page
      .getByRole("navigation", { name: "Primary" })
      .locator("a, button")
      .filter({ visible: true })
      .allInnerTexts();
  }

  async footerLinks() {
    return this.page.getByRole("navigation", { name: "Footer" }).getByRole("link").allInnerTexts();
  }

  async scrollsHorizontally() {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  }

  async accessibilityViolations() {
    const results = await new AxeBuilder({ page: this.page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    return results.violations.map((v) => `${v.id}: ${v.help}`);
  }
}
