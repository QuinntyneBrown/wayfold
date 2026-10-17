import { expect, test } from "@playwright/test";
import { DANFORTH, fakeApi, fakeSession, TENDAI } from "../pages/fake-api";
import { type BusinessForm, ProviderEditorPage } from "../pages/provider-editor-page";

const PROVIDER_ID = "6f1d2c1e-0000-4000-8000-0000000000d1";

const BUSINESS: BusinessForm = {
  name: "Danforth Auto Care",
  category: "Mechanic",
  municipality: "Toronto",
  description: "Honest repairs and clear explanations for Toronto drivers.",
  contactEmail: "hello@danforthautocare.example",
  phone: "416-555-0123",
};

test.describe("List your business", () => {
  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
  });

  test("offers the nine categories and only GTA municipalities in an accessible form", async ({ page }) => {
    const editor = new ProviderEditorPage(page);

    await editor.open();

    await expect(editor.category).toBeVisible();
    expect(await editor.categoryOptions()).toEqual([
      "Dealer",
      "Mechanic",
      "Body shop",
      "Tire shop",
      "Detailer",
      "Towing",
      "Insurance broker",
      "Financing professional",
      "Parts store",
    ]);
    const municipalities = await editor.municipalityOptions();
    expect(municipalities).toContain("Brampton");
    expect(municipalities).not.toContain("Hamilton");
    expect(await editor.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows a loading state until the session is known", async ({ page }) => {
    const session = await fakeSession(page, TENDAI, { hold: true });
    const editor = new ProviderEditorPage(page);

    await editor.open();
    await expect(editor.loadingStatus).toBeVisible();
    session.release();

    await expect(editor.name).toBeVisible();
  });

  test("creates the profile and links to it", async ({ page }) => {
    const create = await fakeApi(page, "POST", "/api/providers", { status: 201, json: { id: PROVIDER_ID } });
    const editor = new ProviderEditorPage(page);
    await editor.open();

    await editor.fill(BUSINESS);
    await editor.save();

    await expect(editor.heading).toHaveText("Business submitted");
    await expect(editor.viewProfile).toHaveAttribute("href", `/providers/${PROVIDER_ID}`);
    expect(create.lastBody()).toEqual({ ...BUSINESS, category: "mechanic" });
    expect(await editor.shell.accessibilityViolations()).toEqual([]);
  });

  test("marks the fields the server rejected and creates nothing", async ({ page }) => {
    await fakeApi(page, "POST", "/api/providers", {
      status: 400,
      json: { fieldErrors: { name: "Enter a name", contactEmail: "Enter a contact email" } },
    });
    const editor = new ProviderEditorPage(page);
    await editor.open();

    await editor.save();

    await expect(editor.alert).toContainText("Complete the required fields");
    await expect(editor.name).toHaveAccessibleDescription("Enter a name");
    await expect(editor.contactEmail).toHaveAccessibleDescription("Enter a contact email");
    await expect(editor.name).toHaveAttribute("aria-invalid", "true");
    await expect(editor.viewProfile).toHaveCount(0);
    expect(await editor.shell.accessibilityViolations()).toEqual([]);
  });

  test("disables saving while the request is in flight", async ({ page }) => {
    const create = await fakeApi(page, "POST", "/api/providers", { status: 201, json: { id: PROVIDER_ID } }, { hold: true });
    const editor = new ProviderEditorPage(page);
    await editor.open();
    await editor.fill(BUSINESS);

    await editor.save();

    await expect(editor.saveButton).toBeDisabled();
    await expect(editor.saveButton).toHaveText("Saving…");
    create.release();
    await expect(editor.heading).toHaveText("Business submitted");
  });

  test("keeps what was typed when saving fails", async ({ page }) => {
    await fakeApi(page, "POST", "/api/providers", { status: 500 });
    const editor = new ProviderEditorPage(page);
    await editor.open();
    await editor.fill(BUSINESS);

    await editor.save();

    await expect(editor.alert).toContainText("Something went wrong");
    await expect(editor.name).toHaveValue(BUSINESS.name);
    await expect(editor.saveButton).toBeEnabled();
  });

  test("sends a signed-out visitor to sign in", async ({ page }) => {
    await fakeSession(page, null);
    const editor = new ProviderEditorPage(page);

    await editor.open();

    await expect(page).toHaveURL("/sign-in");
  });

  test("fits a 360 px viewport with every field and the save button reachable", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const editor = new ProviderEditorPage(page);

    await editor.open();

    await editor.saveButton.scrollIntoViewIfNeeded();
    await expect(editor.saveButton).toBeInViewport();
    expect(await editor.hasHorizontalScroll()).toBe(false);
  });
});

test.describe("Edit your business", () => {
  const OWNED = { ...DANFORTH, isOwner: true };

  test.beforeEach(async ({ page }) => {
    await fakeSession(page, TENDAI);
  });

  test("pre-fills the saved profile, saves the changes and returns to the profile", async ({ page }) => {
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: OWNED });
    const save = await fakeApi(page, "PUT", `/api/providers/${DANFORTH.id}`, { status: 200 });
    const editor = new ProviderEditorPage(page);

    await editor.openEdit(DANFORTH.id);

    await expect(editor.heading).toHaveText("Edit your business");
    await expect(editor.name).toHaveValue("Danforth Auto Care");
    await expect(editor.category).toHaveValue("mechanic");
    await expect(editor.municipality).toHaveValue("Toronto");
    await expect(editor.description).toHaveValue(DANFORTH.description);
    await expect(editor.contactEmail).toHaveValue(DANFORTH.contactEmail);
    await expect(editor.phone).toHaveValue("416-555-0123");
    expect(await editor.shell.accessibilityViolations()).toEqual([]);

    await editor.name.fill("Danforth Auto & Tire");
    await editor.save();

    await expect(page).toHaveURL(`/providers/${DANFORTH.id}`);
    expect(save.lastBody()).toEqual({
      name: "Danforth Auto & Tire",
      category: "mechanic",
      municipality: "Toronto",
      description: DANFORTH.description,
      contactEmail: DANFORTH.contactEmail,
      phone: "416-555-0123",
    });
  });

  test("marks the fields the server rejected and keeps the edits", async ({ page }) => {
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: OWNED });
    await fakeApi(page, "PUT", `/api/providers/${DANFORTH.id}`, { status: 400, json: { fieldErrors: { name: "Enter a name" } } });
    const editor = new ProviderEditorPage(page);
    await editor.openEdit(DANFORTH.id);

    await editor.name.fill("");
    await editor.save();

    await expect(editor.alert).toContainText("Complete the required fields");
    await expect(editor.name).toHaveAccessibleDescription("Enter a name");
  });

  test("sends a member who does not own the profile back to it", async ({ page }) => {
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: DANFORTH });
    const editor = new ProviderEditorPage(page);

    await editor.openEdit(DANFORTH.id);

    await expect(page).toHaveURL(`/providers/${DANFORTH.id}`);
  });

  test("sends a signed-out visitor to sign in", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 200, json: OWNED });
    const editor = new ProviderEditorPage(page);

    await editor.openEdit(DANFORTH.id);

    await expect(page).toHaveURL("/sign-in");
  });

  test("shows the not-found page for an unknown profile", async ({ page }) => {
    await fakeApi(page, "GET", `/api/providers/${DANFORTH.id}`, { status: 404 });
    const editor = new ProviderEditorPage(page);

    await editor.openEdit(DANFORTH.id);

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("offers Try again when the profile cannot be loaded", async ({ page }) => {
    let fail = true;
    await page.route(`**/api/providers/${DANFORTH.id}`, (route) =>
      fail ? route.fulfill({ status: 500 }) : route.fulfill({ status: 200, json: OWNED }),
    );
    const editor = new ProviderEditorPage(page);
    await editor.openEdit(DANFORTH.id);

    await expect(editor.alert).toContainText("Could not load this page");

    fail = false;
    await editor.tryAgain.click();

    await expect(editor.name).toHaveValue("Danforth Auto Care");
  });
});
