import { expect, test } from "@playwright/test";
import { HomePage } from "../pages/home-page";

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
