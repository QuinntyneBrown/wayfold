import { expect, test } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { SiteMenu } from "../pages/site-menu";

const BREAKPOINTS = [360, 576, 768, 992, 1200];

test.describe("App shell for a signed-out visitor", () => {
  test("shows the primary navigation, footer and home hero on a wide screen", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const home = new HomePage(page);

    await home.open();

    await expect(home.heading).toHaveText("Find your people in the GTA auto community");
    expect(await home.shell.primaryNavItems()).toEqual([
      "Vehicles",
      "Providers",
      "Products",
      "Sign in",
      "Create account",
    ]);
    expect(await home.shell.footerLinks()).toEqual([
      "Vehicles",
      "Providers",
      "Products",
      "Create account",
    ]);
  });

  test("lets a keyboard user skip straight to the content", async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await page.keyboard.press("Tab");
    await expect(home.shell.skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(home.shell.main).toBeFocused();
  });

  for (const width of BREAKPOINTS) {
    test(`fits a ${width} px viewport without horizontal scrolling or accessibility violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const home = new HomePage(page);

      await home.open();

      await expect(home.heading).toBeVisible();
      expect(await home.shell.scrollsHorizontally()).toBe(false);
      expect(await home.shell.accessibilityViolations()).toEqual([]);
    });
  }
});

test.describe("Site menu on a phone", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
  });

  test("replaces the inline links with a Menu control", async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    expect(await home.shell.primaryNavItems()).toEqual(["Menu"]);
  });

  test("opens by keyboard, holds focus, and closes on Escape back to the Menu control", async ({ page }) => {
    const home = new HomePage(page);
    const menu = new SiteMenu(page);
    await home.open();

    await menu.openWithKeyboard();

    await expect(menu.dialog).toBeVisible();
    expect(await menu.destinations()).toEqual([
      "Vehicles",
      "Providers",
      "Products",
      "Sign in",
      "Create account",
    ]);
    expect(await menu.containsFocus()).toBe(true);
    expect(await home.shell.accessibilityViolations()).toEqual([]);

    await menu.closeWithEscape();

    await expect(menu.dialog).toBeHidden();
    await expect(menu.menuControl).toBeFocused();
  });
});
