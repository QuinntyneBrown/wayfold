import { expect, test } from "@playwright/test";
import { fakeApi, fakeSession, PRIYA, TENDAI } from "../pages/fake-api";
import { MemberProfilePage } from "../pages/member-profile-page";

test.describe("Member profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test("shows another member's profile with the church tag and sections", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: PRIYA });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);

    await expect(profile.heading).toHaveText("Priya Nair");
    await expect(profile.header).toContainText("Etobicoke");
    await expect(profile.header).toContainText("32 followers");
    await expect(profile.header).toContainText(PRIYA.bio!);
    await expect(profile.churchTag).toHaveText("Lakeshore Fellowship");
    await expect(profile.editProfileButton).toHaveCount(0);
    await expect(profile.section("Garage")).toHaveAttribute("aria-pressed", "true");
    await expect(profile.sectionContent).toContainText("No cars in this garage yet.");

    await profile.section("For sale").click();
    await expect(profile.sectionContent).toContainText("Nothing for sale right now.");
    await profile.section("Recommendations").click();
    await expect(profile.sectionContent).toContainText("No recommendations yet.");
    await profile.section("Posts").click();
    await expect(profile.sectionContent).toContainText("No posts yet.");
    await expect(profile.section("Posts")).toHaveAttribute("aria-pressed", "true");
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows no church tag when the response carries no church", async ({ page }) => {
    await fakeSession(page, TENDAI);
    const withoutChurch: Record<string, unknown> = { ...PRIYA };
    delete withoutChurch.homeChurch;
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: withoutChurch });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);

    await expect(profile.heading).toHaveText("Priya Nair");
    await expect(profile.churchTag).toHaveCount(0);
  });

  test("opens the garage section from the member's garage link", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: PRIYA });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id, "#garage");

    await expect(profile.section("Garage")).toHaveAttribute("aria-pressed", "true");
  });

  test("shows a loading state, then the profile", async ({ page }) => {
    await fakeSession(page, TENDAI);
    const api = await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: PRIYA }, { hold: true });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);
    await expect(profile.loadingStatus).toBeVisible();
    api.release();

    await expect(profile.heading).toHaveText("Priya Nair");
    await expect(profile.loadingStatus).toHaveCount(0);
  });

  test("sends a signed-out visitor to sign in and shows no profile", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 401 });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByText("Priya Nair")).toHaveCount(0);
  });

  test("offers Try again when the profile cannot be loaded", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 500 });
    const profile = new MemberProfilePage(page);
    await profile.open(PRIYA.id);
    await expect(profile.loadError).toContainText("Could not load this page");

    await page.unroute(`**/api/members/${PRIYA.id}`);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 200, json: PRIYA });
    await profile.tryAgain.click();

    await expect(profile.heading).toHaveText("Priya Nair");
  });

  test("shows the not-found page for an unknown member", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/members/${PRIYA.id}`, { status: 404 });
    const profile = new MemberProfilePage(page);

    await profile.open(PRIYA.id);

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

test.describe("Member profile: own profile and bio", () => {
  const OWN = { ...PRIYA, id: TENDAI.id, displayName: "Tendai Mensah", isOwner: true, bio: "Old bio." };

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", `/api/members/${TENDAI.id}`, { status: 200, json: OWN });
  });

  test("offers Edit profile and saves a new bio", async ({ page }) => {
    const patch = await fakeApi(page, "PATCH", "/api/members/me", { status: 200 }, { hold: true });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);

    await profile.editProfileButton.click();
    await expect(profile.editProfileDialog).toBeVisible();
    await expect(profile.bioField).toHaveValue("Old bio.");
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
    await profile.bioField.fill("Fixing Hondas since 2009.");
    await profile.saveProfile.click();

    await expect(profile.saveProfile).toBeDisabled();
    await expect(profile.saveProfile).toHaveAttribute("aria-busy", "true");
    patch.release();

    await expect(profile.editProfileDialog).toBeHidden();
    await expect(profile.header).toContainText("Fixing Hondas since 2009.");
    expect(patch.lastBody()).toEqual({ bio: "Fixing Hondas since 2009." });
    await expect(profile.editProfileButton).toBeFocused();
  });

  test("shows the bio field error and keeps the dialog open", async ({ page }) => {
    await fakeApi(page, "PATCH", "/api/members/me", {
      status: 400,
      json: { fieldErrors: { bio: "Use 500 characters or fewer" } },
    });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.editProfileButton.click();

    await profile.saveProfile.click();

    await expect(profile.editProfileDialog.getByText("Use 500 characters or fewer")).toBeVisible();
    await expect(profile.bioField).toHaveAttribute("aria-invalid", "true");
    await expect(profile.editProfileDialog).toBeVisible();
    expect(await profile.shell.accessibilityViolations()).toEqual([]);
  });

  test("keeps the text and asks to try again when saving fails", async ({ page }) => {
    await fakeApi(page, "PATCH", "/api/members/me", { status: 500 });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.editProfileButton.click();
    await profile.bioField.fill("Unsaved words");

    await profile.saveProfile.click();

    await expect(profile.editProfileAlert).toContainText("Could not save");
    await expect(profile.bioField).toHaveValue("Unsaved words");
  });

  test("closes without saving on Cancel", async ({ page }) => {
    const patch = await fakeApi(page, "PATCH", "/api/members/me", { status: 200 });
    const profile = new MemberProfilePage(page);
    await profile.open(TENDAI.id);
    await profile.editProfileButton.click();

    await profile.cancelEditProfile.click();

    await expect(profile.editProfileDialog).toBeHidden();
    expect(patch.callCount()).toBe(0);
  });
});
