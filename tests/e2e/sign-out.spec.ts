import { expect, test } from "@playwright/test";
import { AccountMenu } from "../pages/account-menu";
import { fakeApi, fakeSession, TENDAI } from "../pages/fake-api";
import { HomePage } from "../pages/home-page";
import { SiteMenu } from "../pages/site-menu";

test.describe("Sign out", () => {
  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [] } });
  });

  test("signs out from the account menu and shows the visitor navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    const signOutApi = await fakeApi(page, "POST", "/api/auth/sign-out", { status: 204 });
    const home = new HomePage(page);
    const accountMenu = new AccountMenu(page, TENDAI.displayName);
    await home.open();
    await accountMenu.openWithKeyboard();
    await fakeSession(page, null);

    await accountMenu.signOut();

    await expect.poll(() => home.shell.primaryNavItems()).toContain("Sign in");
    await expect(page).toHaveURL("/");
    expect(signOutApi.callCount()).toBe(1);
  });

  test("signs out from the phone site menu", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const signOutApi = await fakeApi(page, "POST", "/api/auth/sign-out", { status: 204 });
    const home = new HomePage(page);
    const menu = new SiteMenu(page);
    await home.open();
    await menu.openWithKeyboard();
    await expect.poll(() => menu.destinations()).toContain("Sign out");
    await fakeSession(page, null);

    await menu.signOut();

    await menu.openWithKeyboard();
    await expect.poll(() => menu.destinations()).toContain("Sign in");
    expect(signOutApi.callCount()).toBe(1);
  });
});
