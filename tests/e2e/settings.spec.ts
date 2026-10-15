import { expect, test } from "@playwright/test";
import { fakeApi, fakeSession, TENDAI, TENDAI_SETTINGS } from "../pages/fake-api";
import { ServerErrorPage } from "../pages/server-error-page";
import { SettingsPage } from "../pages/settings-page";

test.describe("Settings: loading", () => {
  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
  });

  test("shows a loading state, then the member's settings in an accessible form", async ({ page }) => {
    const account = await fakeApi(page, "GET", "/api/account", { status: 200, json: TENDAI_SETTINGS }, { hold: true });
    const settings = new SettingsPage(page);

    await settings.open();
    await expect(settings.loadingStatus).toBeVisible();
    account.release();

    await expect(settings.displayName).toHaveValue("Tendai Mensah");
    await expect(settings.area).toHaveValue("Toronto");
    await expect(settings.homeChurch).toHaveValue("Lakeshore Fellowship");
    await expect(settings.showChurch).toBeChecked();
    await expect(settings.showChurch).toHaveAccessibleDescription("Your church is never visible to signed-out visitors.");
    const options = await settings.areaOptions();
    expect(options).toContain("Brampton");
    expect(options).toContain("Brock");
    expect(options).not.toContain("Hamilton");
    expect(await settings.shell.accessibilityViolations()).toEqual([]);
  });

  test("sends a signed-out visitor to sign in", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", "/api/account", { status: 401 });
    const settings = new SettingsPage(page);

    await settings.open();

    await expect(page).toHaveURL("/sign-in");
  });

  test("offers Try again when the settings cannot be loaded", async ({ page }) => {
    let fail = true;
    await page.route("**/api/account", (route) =>
      fail ? route.fulfill({ status: 500 }) : route.fulfill({ status: 200, json: TENDAI_SETTINGS }),
    );
    const settings = new SettingsPage(page);
    await settings.open();

    await expect(settings.alert).toContainText("Could not load this page");
    expect(await settings.shell.accessibilityViolations()).toEqual([]);

    fail = false;
    await settings.tryAgain.click();

    await expect(settings.displayName).toHaveValue("Tendai Mensah");
  });

  test("shows the generic something-went-wrong page for an unexpected response", async ({ page }) => {
    await page.route("**/api/account", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "<<not json: secret detail>>" }),
    );
    const settings = new SettingsPage(page);
    const errorPage = new ServerErrorPage(page);

    await settings.open();

    await expect(errorPage.heading).toHaveText("Something went wrong");
    await expect(errorPage.message).toBeVisible();
    await expect(errorPage.goHomeLink).toBeVisible();
    await expect(page.getByText("secret detail")).toHaveCount(0);
  });
});
