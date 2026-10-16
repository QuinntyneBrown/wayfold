import { expect, test } from "@playwright/test";
import { CIVIC_DETAIL, fakeApi, fakeSession, RAV4_DETAIL, TENDAI } from "../pages/fake-api";
import { VehicleDetailPage } from "../pages/vehicle-detail-page";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
});

test.describe("a private listing", () => {
  test("shows the vehicle, its details and the member seller panel with their church", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: RAV4_DETAIL });
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);

    await expect(detail.heading).toHaveText("2019 Toyota RAV4 XLE");
    await expect(detail.summary).toHaveText("$29,500 · Private seller · Etobicoke");
    await expect(detail.photo).toHaveAttribute("src", "/api/photos/rav4.jpg");
    await expect(detail.details).toContainText("71,000 km");
    await expect(detail.details).toContainText("Used");
    await expect(detail.details).toContainText("Etobicoke");
    await expect(detail.details).toContainText("Heated seats, Backup camera");
    await expect(detail.details).toContainText("Regular service, clean interior and ready for a test drive.");
    await expect(detail.sellerPanel).toContainText("Priya Nair");
    await expect(detail.homeChurch).toHaveText("Lakeshore Fellowship");
  });

  test("shows no church when the API returns none", async ({ page }) => {
    await fakeSession(page, null);
    const seller = { ...RAV4_DETAIL.seller, homeChurch: undefined };
    await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: { ...RAV4_DETAIL, seller } });
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);

    await expect(detail.sellerPanel).toContainText("Priya Nair");
    await expect(detail.homeChurch).toHaveCount(0);
  });
});

test.describe("a dealer listing", () => {
  test("shows the vehicle and a link to the dealer profile", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/vehicles/${CIVIC_DETAIL.id}`, { status: 200, json: CIVIC_DETAIL });
    const detail = new VehicleDetailPage(page);

    await detail.open(CIVIC_DETAIL.id);

    await expect(detail.heading).toHaveText("2021 Honda Civic Sport");
    await expect(detail.summary).toHaveText("$24,995 · Dealer · Scarborough");
    await expect(detail.details).toContainText("48,200 km");
    await expect(detail.details).not.toContainText("Features");
    await expect(detail.sellerPanel).toContainText("Eglinton Auto Group");
    await expect(detail.dealerProfileLink).toHaveAttribute("href", CIVIC_DETAIL.seller.profilePath);
  });
});
