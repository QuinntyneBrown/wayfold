import { expect, test } from "@playwright/test";
import { CIVIC_DETAIL, fakeApi, fakeNetworkFailure, fakeSession, RAV4_DETAIL, TENDAI } from "../pages/fake-api";
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

test.describe("loading and failing", () => {
  test("shows a loading state while the vehicle loads", async ({ page }) => {
    await fakeSession(page, null);
    const api = await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: RAV4_DETAIL }, { hold: true });
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);
    await expect(detail.loadingStatus).toBeVisible();

    api.release();
    await expect(detail.heading).toHaveText("2019 Toyota RAV4 XLE");
    await expect(detail.loadingStatus).toHaveCount(0);
  });

  for (const [name, status] of [["the server fails", 500], ["the vehicle is not found", 404]] as const) {
    test(`offers Try again when ${name}`, async ({ page }) => {
      await fakeSession(page, null);
      await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status });
      const detail = new VehicleDetailPage(page);

      await detail.open(RAV4_DETAIL.id);
      await expect(detail.loadError).toContainText("Could not load this page");

      await page.unroute(`**/api/vehicles/${RAV4_DETAIL.id}`);
      await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: RAV4_DETAIL });
      await detail.tryAgain.click();
      await expect(detail.heading).toHaveText("2019 Toyota RAV4 XLE");
    });
  }

  test("offers Try again when the network fails", async ({ page }) => {
    await fakeSession(page, null);
    await fakeNetworkFailure(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`);
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);

    await expect(detail.loadError).toContainText("Could not load this page");
  });
});

test.describe("a sold listing", () => {
  test("says the vehicle is no longer available and offers no way to message the seller", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/vehicles/${CIVIC_DETAIL.id}`, {
      status: 200,
      json: { ...CIVIC_DETAIL, status: "sold", seller: { ...CIVIC_DETAIL.seller, canMessage: false } },
    });
    const detail = new VehicleDetailPage(page);

    await detail.open(CIVIC_DETAIL.id);

    await expect(detail.heading).toHaveText("2021 Honda Civic Sport");
    await expect(detail.soldNotice).toBeVisible();
    await expect(detail.sellerPanel.getByRole("button")).toHaveCount(0);
  });
});

test.describe("messaging the seller", () => {
  test("sends a signed-out visitor to sign in", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/vehicles/${CIVIC_DETAIL.id}`, { status: 200, json: CIVIC_DETAIL });
    const detail = new VehicleDetailPage(page);

    await detail.open(CIVIC_DETAIL.id);
    await detail.messageSellerLink.click();

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("offers a signed-in member the Message seller button", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: RAV4_DETAIL });
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);

    await expect(detail.messageSellerButton).toBeVisible();
  });

  test("offers the owner no way to message themselves", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, {
      status: 200,
      json: { ...RAV4_DETAIL, seller: { ...RAV4_DETAIL.seller, canMessage: false } },
    });
    const detail = new VehicleDetailPage(page);

    await detail.open(RAV4_DETAIL.id);

    await expect(detail.sellerPanel).toContainText("Priya Nair");
    await expect(detail.messageSeller).toHaveCount(0);
  });
});

test.describe("the Message the seller dialog", () => {
  const inquiries = `/api/vehicles/${RAV4_DETAIL.id}/inquiries`;

  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/vehicles/${RAV4_DETAIL.id}`, { status: 200, json: RAV4_DETAIL });
  });

  test("sends the message and confirms it", async ({ page }) => {
    const api = await fakeApi(page, "POST", inquiries, { status: 201 });
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.message.fill("Is it still available?");
    await detail.sendButton.click();

    await expect(detail.sentConfirmation).toBeVisible();
    expect(api.lastBody()).toEqual({ message: "Is it still available?" });

    await detail.doneButton.click();
    await expect(detail.messageDialog).toBeHidden();
  });

  test("closes without sending when cancelled", async ({ page }) => {
    const api = await fakeApi(page, "POST", inquiries, { status: 201 });
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.message.fill("Never mind");
    await detail.cancelButton.click();

    await expect(detail.messageDialog).toBeHidden();
    expect(api.callCount()).toBe(0);
  });

  test("disables sending while the message is on its way", async ({ page }) => {
    const api = await fakeApi(page, "POST", inquiries, { status: 201 }, { hold: true });
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.message.fill("Hello");
    await detail.sendButton.click();

    await expect(detail.sendButton).toBeDisabled();
    await expect(detail.sendButton).toHaveText("Sending…");

    api.release();
    await expect(detail.sentConfirmation).toBeVisible();
  });

  test("shows the field error when the message is rejected", async ({ page }) => {
    await fakeApi(page, "POST", inquiries, { status: 400, json: { fieldErrors: { message: "Write a message" } } });
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.sendButton.click();

    await expect(detail.dialogAlert).toContainText("Check the marked fields");
    await expect(detail.message).toHaveAccessibleDescription("Write a message");
    await expect(detail.message).toHaveAttribute("aria-invalid", "true");
  });

  test("keeps the typed text when sending fails", async ({ page }) => {
    await fakeApi(page, "POST", inquiries, { status: 500 });
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.message.fill("Is it still available?");
    await detail.sendButton.click();

    await expect(detail.dialogAlert).toContainText("Could not send");
    await expect(detail.message).toHaveValue("Is it still available?");
    await expect(detail.sendButton).toBeEnabled();
  });

  test("keeps the typed text when the network fails", async ({ page }) => {
    await fakeNetworkFailure(page, "POST", inquiries);
    const detail = new VehicleDetailPage(page);
    await detail.open(RAV4_DETAIL.id);

    await detail.openMessageDialog();
    await detail.message.fill("Is it still available?");
    await detail.sendButton.click();

    await expect(detail.dialogAlert).toContainText("Could not send");
    await expect(detail.message).toHaveValue("Is it still available?");
  });
});
