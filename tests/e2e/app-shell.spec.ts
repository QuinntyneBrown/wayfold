import { expect, test } from "@playwright/test";
import { AccountMenu } from "../pages/account-menu";
import { fakeApi, fakeSession, TENDAI } from "../pages/fake-api";
import { HomePage } from "../pages/home-page";
import { SiteMenu } from "../pages/site-menu";

const BREAKPOINTS = [360, 576, 768, 992, 1200];

test.describe("App shell for a signed-out visitor", () => {
  test.beforeEach(async ({ page }) => {
    await fakeSession(page, null);
  });

  test("shows the primary navigation, footer and home hero on a wide screen", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const home = new HomePage(page);

    await home.open();

    await expect(home.heading).toHaveText("Find your people in the GTA auto community");
    await expect.poll(() => home.shell.primaryNavItems()).toEqual([
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
    await fakeSession(page, null);
  });

  test("replaces the inline links with a Menu control", async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    await expect.poll(() => home.shell.primaryNavItems()).toEqual(["Menu"]);
  });

  test("opens by keyboard, holds focus, and closes on Escape back to the Menu control", async ({ page }) => {
    const home = new HomePage(page);
    const menu = new SiteMenu(page);
    await home.open();
    await expect.poll(() => home.shell.primaryNavItems()).toEqual(["Menu"]);

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

test.describe("App shell for a signed-in member", () => {
  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [] } });
  });

  test("shows the member navigation and an account menu that opens and closes by keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const home = new HomePage(page);
    const accountMenu = new AccountMenu(page, TENDAI.displayName);
    await home.open();

    await expect.poll(() => home.shell.primaryNavLinks()).toEqual([
      "Feed",
      "Vehicles",
      "Providers",
      "Products",
      "Sell your car",
    ]);
    await expect(accountMenu.avatarButton).toBeVisible();

    await accountMenu.openWithKeyboard();

    await expect(accountMenu.dialog).toBeVisible();
    expect(await accountMenu.items()).toEqual([
      "Your profile",
      "Your garage",
      "Settings",
      "List your business",
      "Sign out",
    ]);
    expect(await home.shell.accessibilityViolations()).toEqual([]);

    await accountMenu.closeWithEscape();

    await expect(accountMenu.dialog).toBeHidden();
    await expect(accountMenu.avatarButton).toBeFocused();
  });

  test("lists the member destinations in the phone site menu", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const home = new HomePage(page);
    const menu = new SiteMenu(page);
    await home.open();

    await menu.openWithKeyboard();

    await expect.poll(() => menu.destinations()).toEqual([
      "Feed",
      "Vehicles",
      "Providers",
      "Products",
      "Sell your car",
      "Your profile",
      "Your garage",
      "Settings",
      "List your business",
      "Sign out",
    ]);
  });
});
