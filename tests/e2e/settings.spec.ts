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

test.describe("Settings: saving", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/account", { status: 200, json: TENDAI_SETTINGS });
  });

  test("saves the profile, confirms it and updates the name in the header", async ({ page }) => {
    const putApi = await fakeApi(page, "PUT", "/api/account", { status: 200 }, { hold: true });
    const settings = new SettingsPage(page);
    await settings.open();
    await settings.displayName.fill("Tendai M.");
    await settings.area.selectOption("Brampton");
    await settings.homeChurch.fill("Grace Community Church");
    await settings.showChurch.uncheck();

    await settings.save();

    await expect(settings.saveButton).toBeDisabled();
    await expect(settings.saveButton).toHaveAttribute("aria-busy", "true");
    await fakeSession(page, { ...TENDAI, displayName: "Tendai M." });
    putApi.release();

    await expect(settings.savedNotice).toContainText("Your profile and church visibility have been updated.");
    expect(putApi.lastBody()).toMatchObject({
      displayName: "Tendai M.",
      gtaArea: "Brampton",
      homeChurch: "Grace Community Church",
      showHomeChurch: false,
    });
    await expect(page.getByRole("button", { name: "Account menu for Tendai M." })).toBeVisible();
    expect(await settings.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows a field error next to the field and keeps the form editable", async ({ page }) => {
    await fakeApi(page, "PUT", "/api/account", {
      status: 400,
      json: { fieldErrors: { homeChurch: "Use 80 characters or fewer" } },
    });
    const settings = new SettingsPage(page);
    await settings.open();
    await settings.homeChurch.fill("x".repeat(81));

    await settings.save();

    await expect(settings.alert).toContainText("Check your settings");
    await expect(settings.homeChurch).toHaveAccessibleDescription("Use 80 characters or fewer");
    await expect(settings.homeChurch).toHaveAttribute("aria-invalid", "true");
    await expect(settings.saveButton).toBeEnabled();
    expect(await settings.shell.accessibilityViolations()).toEqual([]);
  });

  test("asks the member to try again when saving fails", async ({ page }) => {
    await fakeApi(page, "PUT", "/api/account", { status: 500 });
    const settings = new SettingsPage(page);
    await settings.open();

    await settings.save();

    await expect(settings.alert).toContainText("Something went wrong");
  });
});
