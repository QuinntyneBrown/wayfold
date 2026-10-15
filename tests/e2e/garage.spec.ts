import { expect, test } from "@playwright/test";
import { fakeApi, fakeSession, PRIYA, TENDAI } from "../pages/fake-api";
import { MemberProfilePage } from "../pages/member-profile-page";

const BLUEBIRD = {
  id: "6f1d2c1e-0000-4000-8000-0000000000c1",
  year: 2015,
  make: "Honda",
  model: "Fit",
  nickname: "Bluebird",
  photoRef: null,
  notes: "My reliable city runabout.",
};
const BLUEBIRD_TITLE = "2015 Honda Fit “Bluebird”";
const OWN = { ...PRIYA, id: TENDAI.id, displayName: "Tendai Mensah", isOwner: true, garage: [BLUEBIRD] };
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

test.describe("Garage", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
  });

  test("shows the owner's cars with Edit and Remove, and Add a car", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: OWN });
    const profile = new MemberProfilePage(page);

    await profile.open(TENDAI.id);

    await expect(profile.carCard(BLUEBIRD_TITLE)).toContainText("My reliable city runabout.");
    await expect(profile.editCarButton(BLUEBIRD_TITLE)).toBeVisible();
    await expect(profile.removeCarButton(BLUEBIRD_TITLE)).toBeVisible();
    await expect(profile.addCarButton).toBeVisible();
  });

  test("shows another member's cars without any controls", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: { ...PRIYA, garage: [BLUEBIRD] } });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);

    await expect(profile.carCard(BLUEBIRD_TITLE)).toBeVisible();
    await expect(profile.editCarButton(BLUEBIRD_TITLE)).toHaveCount(0);
    await expect(profile.removeCarButton(BLUEBIRD_TITLE)).toHaveCount(0);
    await expect(profile.addCarButton).toHaveCount(0);
  });

  test("fits a 360 px viewport in one column without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const second = { ...BLUEBIRD, id: "6f1d2c1e-0000-4000-8000-0000000000c2", make: "Mazda", model: "3", nickname: null };
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: { ...OWN, garage: [BLUEBIRD, second] } });
    const profile = new MemberProfilePage(page);

    await profile.open(TENDAI.id);

    await expect(profile.carCards).toHaveCount(2);
    const [first, next] = await Promise.all([profile.carCards.nth(0).boundingBox(), profile.carCards.nth(1).boundingBox()]);
    expect(next!.y).toBeGreaterThan(first!.y);
    expect(await profile.hasHorizontalScroll()).toBe(false);
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("adds a car with a photo and shows it in the garage", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: { ...OWN, garage: [] } });
    const post = await fakeApi(
      page,
      "POST",
      "/api/garage-cars",
      { status: 201, json: { id: "6f1d2c1e-0000-4000-8000-0000000000c3", year: 2019, make: "Toyota", model: "RAV4", nickname: null, photoRef: null, notes: null } },
      { hold: true },
    );
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await expect(profile.sectionContent).toContainText("No cars in this garage yet.");

    await profile.addCarButton.click();
    await expect(profile.carDialog).toBeVisible();
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
    await profile.carField("Year").fill("2019");
    await profile.carField("Make").fill("Toyota");
    await profile.carField("Model").fill("RAV4");
    await profile.carField("Photo (optional)").setInputFiles({ name: "rav4.png", mimeType: "image/png", buffer: PNG });
    await profile.submitCar.click();

    await expect(profile.submitCar).toBeDisabled();
    await expect(profile.submitCar).toHaveText("Sending…");
    await expect(profile.cancelCar).toBeDisabled();
    post.release();

    await expect(profile.carDialog).toBeHidden();
    await expect(profile.carCard("2019 Toyota RAV4")).toBeVisible();
    expect(post.lastText()).toContain('name="make"');
    expect(post.lastText()).toContain("Toyota");
    expect(post.lastText()).toContain('filename="rav4.png"');
    await expect(profile.addCarButton).toBeFocused();
  });

  test("shows a field error next to each marked field and adds nothing", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: { ...OWN, garage: [] } });
    await fakeApi(page, "POST", "/api/garage-cars", {
      status: 400,
      json: { fieldErrors: { year: "Enter a year", make: "Enter a make", model: "Enter a model", photo: "Choose a JPEG, PNG or WebP image" } },
    });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.addCarButton.click();

    await profile.submitCar.click();

    await expect(profile.carAlert).toContainText("Check the marked fields");
    await expect(profile.carDialog.getByText("Enter a year")).toBeVisible();
    await expect(profile.carDialog.getByText("Enter a make")).toBeVisible();
    await expect(profile.carDialog.getByText("Enter a model")).toBeVisible();
    await expect(profile.carDialog.getByText("Choose a JPEG, PNG or WebP image")).toBeVisible();
    await expect(profile.carField("Year")).toHaveAttribute("aria-invalid", "true");
    await expect(profile.carCards).toHaveCount(0);
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("keeps what was typed and asks to try again when sending fails", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: { ...OWN, garage: [] } });
    await fakeApi(page, "POST", "/api/garage-cars", { status: 500 });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.addCarButton.click();
    await profile.carField("Year").fill("2019");
    await profile.carField("Make").fill("Toyota");
    await profile.carField("Model").fill("RAV4");

    await profile.submitCar.click();

    await expect(profile.carAlert).toContainText("Could not send");
    await expect(profile.carField("Make")).toHaveValue("Toyota");
    await expect(profile.submitCar).toBeEnabled();
  });

  test("starts an empty form each time Add a car is opened", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: { ...OWN, garage: [] } });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.addCarButton.click();
    await profile.carField("Make").fill("Toyota");
    await profile.cancelCar.click();
    await expect(profile.carDialog).toBeHidden();

    await profile.addCarButton.click();

    await expect(profile.carField("Make")).toHaveValue("");
  });

  test("edits a car from its current values", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: OWN });
    const patch = await fakeApi(page, "PATCH", `/api/garage-cars/${BLUEBIRD.id}`, {
      status: 200,
      json: { ...BLUEBIRD, model: "Fit EX", nickname: null },
    });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);

    await profile.editCarButton(BLUEBIRD_TITLE).click();
    await expect(profile.carField("Model")).toHaveValue("Fit");
    await expect(profile.carField("Nickname (optional)")).toHaveValue("Bluebird");
    await profile.carField("Model").fill("Fit EX");
    await profile.carField("Nickname (optional)").fill("");
    await profile.submitCar.click();

    await expect(profile.carDialog).toBeHidden();
    await expect(profile.carCard("2015 Honda Fit EX")).toBeVisible();
    expect(patch.lastText()).toContain("Fit EX");
    await expect(profile.editCarButton("2015 Honda Fit EX")).toBeFocused();
  });

  test("removes a car after confirmation", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: OWN });
    const del = await fakeApi(page, "DELETE", `/api/garage-cars/${BLUEBIRD.id}`, { status: 204 });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);

    await profile.removeCarButton(BLUEBIRD_TITLE).click();
    await expect(profile.removeDialog).toContainText(BLUEBIRD_TITLE);
    await expect(profile.cancelRemove).toBeFocused();
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
    await profile.confirmRemove.click();

    await expect(profile.removeDialog).toBeHidden();
    await expect(profile.carCards).toHaveCount(0);
    await expect(profile.sectionContent).toContainText("No cars in this garage yet.");
    expect(del.callCount()).toBe(1);
  });

  test("keeps the car and shows an error when removing fails, and Cancel removes nothing", async ({ page }) => {
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: OWN });
    const del = await fakeApi(page, "DELETE", `/api/garage-cars/${BLUEBIRD.id}`, { status: 500 });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);

    await profile.removeCarButton(BLUEBIRD_TITLE).click();
    await profile.confirmRemove.click();
    await expect(profile.removeAlert).toContainText("Could not remove this car");
    await expect(profile.confirmRemove).toHaveText("Try again");
    await profile.cancelRemove.click();

    await expect(profile.removeDialog).toBeHidden();
    await expect(profile.carCard(BLUEBIRD_TITLE)).toBeVisible();
    expect(del.callCount()).toBe(1);
  });
});
