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
  test("explains that nothing is listed yet when no vehicle is published", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([]));
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.emptyMessage).toBeVisible();
    await expect(vehicles.cards).toHaveCount(0);
  });

  test("offers Clear filters when the filters match nothing", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([]));
    const vehicles = new VehiclesPage(page);

    await vehicles.open("?make=Ford&area=Brampton");

    await expect(vehicles.noResults).toBeVisible();
    await vehicles.clearFilters.click();
    await expect(page).toHaveURL(/\/vehicles$/);
    await expect(vehicles.make).toHaveValue("");
  });

  test("offers Try again when the vehicles cannot be loaded", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", { status: 500 });
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.loadError).toContainText("Could not load this page");
    await page.unroute("**/api/vehicles*");
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4]));
    await vehicles.tryAgain.click();
    await expect(vehicles.cards).toHaveCount(1);
  });
  test("searches with every filter and keeps them in the address", async ({ page }) => {
    const api = await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4]));
    const vehicles = new VehiclesPage(page);
    await vehicles.open();

    await vehicles.keyword.fill("winter tires");
    await vehicles.sellerType.selectOption("private");
    await vehicles.make.selectOption("Toyota");
    await vehicles.model.fill("RAV4");
    await vehicles.minPrice.fill("20000");
    await vehicles.maxPrice.fill("30000");
    await vehicles.municipality.selectOption("Etobicoke");
    await vehicles.searchButton.click();

    await expect(page).toHaveURL(/q=winter\+tires&seller=private&make=Toyota&model=RAV4&minPrice=20000&maxPrice=30000&area=Etobicoke/);
    await expect(vehicles.cards).toHaveCount(1);
    expect(new URL(api.lastUrl()).search).toBe("?q=winter+tires&seller=private&make=Toyota&model=RAV4&minPrice=20000&maxPrice=30000&area=Etobicoke");
  });

  test("fills the form from the address", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4]));
    const vehicles = new VehiclesPage(page);

    await vehicles.open("?q=hauler&seller=dealer&make=Honda&model=Civic&minPrice=100&maxPrice=900&area=Brampton");

    await expect(vehicles.keyword).toHaveValue("hauler");
    await expect(vehicles.sellerType).toHaveValue("dealer");
    await expect(vehicles.make).toHaveValue("Honda");
    await expect(vehicles.model).toHaveValue("Civic");
    await expect(vehicles.minPrice).toHaveValue("100");
    await expect(vehicles.maxPrice).toHaveValue("900");
    await expect(vehicles.municipality).toHaveValue("Brampton");
  });

  test("shows the field error when the search is rejected", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", { status: 400, json: { fieldErrors: { maxPrice: "Max price must be at least min price" } } });
    const vehicles = new VehiclesPage(page);

    await vehicles.open("?minPrice=20000&maxPrice=10000");

    await expect(vehicles.fieldErrors).toHaveText("Max price must be at least min price");
    await expect(vehicles.loadError).toHaveCount(0);
  });
  test("pages through 20 vehicles at a time and keeps the filters", async ({ page }) => {
    const api = await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4], 248, 1));
    const vehicles = new VehiclesPage(page);

    await vehicles.open("?make=Toyota");

    await expect(vehicles.pageStatus).toHaveText("Page 1 of 13");
    await expect(vehicles.previous).toHaveCount(0);
    await vehicles.next.click();

    await expect(page).toHaveURL(/make=Toyota&page=2/);
    expect(new URL(api.lastUrl()).searchParams.get("page")).toBe("2");
  });

  test("offers Previous on later pages and no Next on the last page", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4], 248, 13));
    const vehicles = new VehiclesPage(page);

    await vehicles.open("?page=13");

    await expect(vehicles.pageStatus).toHaveText("Page 13 of 13");
    await expect(vehicles.next).toHaveCount(0);
    await expect(vehicles.previous).toHaveAttribute("href", "/vehicles?page=12");
  });

  test("shows no pagination when everything fits on one page", async ({ page }) => {
    await fakeApi(page, "GET", "/api/vehicles*", vehiclesResult([RAV4], 1));
    const vehicles = new VehiclesPage(page);

    await vehicles.open();

    await expect(vehicles.cards).toHaveCount(1);
    await expect(vehicles.pagination).toHaveCount(0);
  });
});
