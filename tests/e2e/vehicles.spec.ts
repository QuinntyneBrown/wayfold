import { expect, test } from "@playwright/test";
import { CIVIC, fakeApi, fakeSession, RAV4, TENDAI, vehiclesResult } from "../pages/fake-api";
import { VehiclesPage } from "../pages/vehicles-page";

test.describe("Search vehicles", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, null);
  });

  test("shows private and dealer vehicles newest first with the seller on each card", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4, CIVIC], 2));
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.heading).toHaveText("Vehicles");
    await expect(vehicles.resultCount).toHaveText("2 vehicles · Newest first");
    await expect(vehicles.cards).toHaveCount(2);
    await expect(vehicles.card(RAV4.title)).toContainText("$29,500");
    await expect(vehicles.card(RAV4.title)).toContainText("71,000 km · Etobicoke");
    await expect(vehicles.card(RAV4.title)).toContainText("Private seller · Priya Nair");
    await expect(vehicles.card(CIVIC.title)).toContainText("$24,995");
    await expect(vehicles.card(CIVIC.title)).toContainText("Eglinton Auto Group");
    await expect(vehicles.cardLink(RAV4.title)).toHaveAttribute("href", `/vehicles/${RAV4.id}`);
    expect(await vehicles.shell.accessibilityViolations()).toEqual([]);
  });

  test("is open to signed-in members too", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4]));
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.resultCount).toHaveText("1 vehicle · Newest first");
  });

  test("shows a loading state while the vehicles load", async ({ page }) => {
    const api = await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4]), { hold: true });
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.loadingStatus).toBeVisible();
    api.release();
    await expect(vehicles.cards).toHaveCount(1);
    await expect(vehicles.loadingStatus).toHaveCount(0);
  });
});
