import { expect, test } from "@playwright/test";
import { DANFORTH, fakeApi, fakeNetworkFailure, fakeSession, TENDAI } from "../pages/fake-api";
import { ProviderProfilePage } from "../pages/provider-profile-page";

test.describe("Provider profile", () => {
  test("shows a signed-out visitor the name, category, area, description and contact but no church", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: DANFORTH });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.heading).toHaveText("Danforth Auto Care");
    await expect(profile.summary).toHaveText("Mechanic in Toronto.");
    await expect(profile.description).toBeVisible();
    await expect(profile.callLink).toHaveAttribute("href", "tel:416-555-0123");
    await expect(profile.emailLink).toHaveAttribute("href", "mailto:hello@danforthautocare.example");
    await expect(profile.ownerChurch).toHaveCount(0);
    await expect(profile.recommendations).toContainText("No recommendations yet.");
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("states the owner's church to a signed-in member", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, {
      status: 200,
      json: { ...DANFORTH, ownerChurch: "St. Paul's Anglican" },
    });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.ownerChurch).toHaveText("Owner attends St. Paul's Anglican");
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("offers the owner, and no one else, a link to edit the profile", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: { ...DANFORTH, isOwner: true } });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.editLink).toHaveAttribute("href", `/providers/${DANFORTH.id}/edit`);

    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: DANFORTH });
    await profile.open(DANFORTH.id);

    await expect(profile.heading).toHaveText("Danforth Auto Care");
    await expect(profile.editLink).toHaveCount(0);
  });

  test("offers no Call action when the provider saved no phone", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: { ...DANFORTH, phone: null } });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.emailLink).toBeVisible();
    await expect(profile.callLink).toHaveCount(0);
  });

  test("shows a loading state, then the profile", async ({ page }) => {
    await fakeSession(page, null);
    const detail = await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: DANFORTH }, { hold: true });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);
    await expect(profile.loadingStatus).toBeVisible();
    detail.release();

    await expect(profile.heading).toHaveText("Danforth Auto Care");
  });

  test("offers Try again when the profile cannot be loaded", async ({ page }) => {
    await fakeSession(page, null);
    let fail = true;
    await page.route(`**/api/providers/${DANFORTH.id}`, (route) =>
      fail ? route.fulfill({ status: 500 }) : route.fulfill({ status: 200, json: DANFORTH }),
    );
    const profile = new ProviderProfilePage(page);
    await profile.open(DANFORTH.id);

    await expect(profile.loadError).toContainText("Could not load this page");
    expect(await profile.shell.accessibilityViolations()).toEqual([]);

    fail = false;
    await profile.tryAgain.click();

    await expect(profile.heading).toHaveText("Danforth Auto Care");
  });

  test("offers Try again when the connection drops", async ({ page }) => {
    await fakeSession(page, null);
    await fakeNetworkFailure(page, "GET", `/api/providers/${DANFORTH.id}`);
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.loadError).toContainText("Could not load this page");
  });

  test("shows the not-found page for an unknown provider", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 404 });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await expect(profile.notFoundHeading).toBeVisible();
  });

  test("fits a 360 px viewport with the contact actions reachable", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, {
      status: 200,
      json: { ...DANFORTH, ownerChurch: "St. Paul's Anglican" },
    });
    const profile = new ProviderProfilePage(page);

    await profile.open(DANFORTH.id);

    await profile.callLink.scrollIntoViewIfNeeded();
    await expect(profile.callLink).toBeInViewport();
    await expect(profile.emailLink).toBeInViewport();
    expect(await profile.hasHorizontalScroll()).toBe(false);
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });
});
