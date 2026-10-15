import { expect, test } from "@playwright/test";
import { fakeApi, fakeSession, TENDAI } from "../pages/fake-api";
import { HomePage } from "../pages/home-page";
import { SignInPage } from "../pages/sign-in-page";

const EMAIL = "tendai@example.com";
const PASSWORD = "correct horse battery";

test.describe("Sign in", () => {
  test("signs the member in and takes them home with the member navigation", async ({ page }) => {
    await fakeSession(page, null);
    const signInApi = await fakeApi(
      page,
      "POST",
      "/api/auth/sign-in",
      { status: 200, json: { displayName: TENDAI.displayName } },
      { hold: true },
    );
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(EMAIL, PASSWORD);

    await expect(signIn.submitButton).toHaveText("Signing in…");
    await expect(signIn.submitButton).toBeDisabled();
    await expect(signIn.submitButton).toHaveAttribute("aria-busy", "true");
    expect(signInApi.lastBody()).toEqual({ email: EMAIL, password: PASSWORD });

    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [] } });
    signInApi.release();

    const home = new HomePage(page);
    await expect(page).toHaveURL("/");
    await expect.poll(() => home.shell.primaryNavLinks()).toContain("Feed");
  });

  test("shows a focused page with a way to create an account", async ({ page }) => {
    await fakeSession(page, null);
    const signIn = new SignInPage(page);

    await signIn.open();

    await expect(signIn.email).toBeVisible();
    await expect(signIn.createAccountLink).toHaveAttribute("href", "/sign-up");
    await expect(signIn.primaryNav).toHaveCount(0);
    expect(await signIn.shell.accessibilityViolations()).toEqual([]);
  });

  test("answers wrong credentials with one generic message", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/sign-in", { status: 401 });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(EMAIL, "not the password");

    await expect(signIn.alert).toContainText("Email or password is incorrect");
    await expect(signIn.email).not.toHaveAttribute("aria-invalid", "true");
    await expect(signIn.password).not.toHaveAttribute("aria-invalid", "true");
    expect(await signIn.shell.accessibilityViolations()).toEqual([]);
  });

  test("tells a locked-out member to wait 15 minutes", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/sign-in", { status: 429 });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(EMAIL, PASSWORD);

    await expect(signIn.alert).toContainText("Too many attempts");
    await expect(signIn.alert).toContainText("Wait 15 minutes before trying again.");
    expect(await signIn.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows field errors next to their fields", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/sign-in", {
      status: 400,
      json: { fieldErrors: { email: "Enter a valid email", password: "Enter your password" } },
    });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn("not-an-email", "");

    await expect(signIn.alert).toContainText("Check these fields");
    await expect(signIn.email).toHaveAccessibleDescription("Enter a valid email");
    await expect(signIn.password).toHaveAccessibleDescription("Enter your password");
    await expect(signIn.email).toHaveAttribute("aria-invalid", "true");
    await expect(signIn.password).toHaveAttribute("aria-invalid", "true");
  });

  test("asks the member to try again when the server fails", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/sign-in", { status: 500 });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(EMAIL, PASSWORD);

    await expect(signIn.alert).toContainText("Something went wrong");
    await expect(signIn.alert).toContainText("Try again in a moment.");
  });

  test("shows a loading state while checking for an existing session", async ({ page }) => {
    const session = await fakeSession(page, null, { hold: true });
    const signIn = new SignInPage(page);

    await signIn.open();

    await expect(signIn.loadingStatus).toBeVisible();
    session.release();
    await expect(signIn.email).toBeVisible();
  });

  test("sends a signed-in member home", async ({ page }) => {
    await fakeSession(page, TENDAI);
    await fakeApi(page, "GET", "/api/feed", { status: 200, json: { posts: [] } });
    const signIn = new SignInPage(page);

    await signIn.open();

    await expect(page).toHaveURL("/");
  });
});
