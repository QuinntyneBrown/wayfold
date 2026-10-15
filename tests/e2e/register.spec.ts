import { expect, test } from "@playwright/test";
import { fakeApi, fakeSession, TENDAI } from "../pages/fake-api";
import { HomePage } from "../pages/home-page";
import { SignUpPage } from "../pages/sign-up-page";

const TENDAI_REGISTRATION = {
  displayName: "Tendai Mensah",
  email: "tendai@example.com",
  password: "correct horse battery",
};

test.describe("Create an account", () => {
  test("creates the account and welcomes the new member", async ({ page }) => {
    await fakeSession(page, null);
    const registerApi = await fakeApi(
      page,
      "POST",
      "/api/auth/register",
      { status: 201, json: { displayName: "Tendai Mensah" } },
      { hold: true },
    );
    const signUp = new SignUpPage(page);
    await signUp.open();

    await signUp.register(TENDAI_REGISTRATION);

    await expect(signUp.submitButton).toHaveText("Creating account…");
    await expect(signUp.submitButton).toBeDisabled();
    await expect(signUp.submitButton).toHaveAttribute("aria-busy", "true");
    expect(registerApi.lastBody()).toEqual(TENDAI_REGISTRATION);

    registerApi.release();

    await expect(signUp.successHeading).toBeVisible();
    expect(await signUp.shell.accessibilityViolations()).toEqual([]);
  });

  test("continues home with the member navigation after registering", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/register", { status: 201, json: { displayName: "Tendai Mensah" } });
    const signUp = new SignUpPage(page);
    await signUp.open();
    await signUp.register(TENDAI_REGISTRATION);
    await expect(signUp.successHeading).toBeVisible();
    await fakeSession(page, TENDAI);

    await signUp.continueToFirstCar();

    const home = new HomePage(page);
    await expect(home.heading).toBeVisible();
    await expect.poll(() => home.shell.primaryNavLinks()).toContain("Feed");
  });

  test("shows a focused header without the primary navigation", async ({ page }) => {
    await fakeSession(page, null);
    const signUp = new SignUpPage(page);

    await signUp.open();

    await expect(signUp.displayName).toBeVisible();
    await expect(signUp.primaryNav).toHaveCount(0);
    expect(await signUp.shell.accessibilityViolations()).toEqual([]);
  });

  test("shows each field error next to its field and announces the problem", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/register", {
      status: 400,
      json: {
        fieldErrors: {
          displayName: "Enter your name",
          email: "Enter a valid email",
          password: "Use at least 12 characters",
        },
      },
    });
    const signUp = new SignUpPage(page);
    await signUp.open();

    await signUp.register({ displayName: "", email: "not-an-email", password: "short" });

    await expect(signUp.alert).toContainText("Check these fields");
    await expect(signUp.displayName).toHaveAccessibleDescription("Enter your name");
    await expect(signUp.email).toHaveAccessibleDescription("Enter a valid email");
    await expect(signUp.password).toHaveAccessibleDescription("Use at least 12 characters");
    for (const field of [signUp.displayName, signUp.email, signUp.password]) {
      await expect(field).toHaveAttribute("aria-invalid", "true");
    }
    expect(await signUp.shell.accessibilityViolations()).toEqual([]);
  });

  test("rejects a registered email without saying whether the account exists", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/register", { status: 409 });
    const signUp = new SignUpPage(page);
    await signUp.open();

    await signUp.register(TENDAI_REGISTRATION);

    await expect(signUp.alert).toContainText("We couldn't create your account");
    await expect(signUp.alert).toContainText("Check your details, or sign in if you already have an account.");
    await expect(signUp.successHeading).toHaveCount(0);
  });

  test("asks the visitor to try again when the server fails", async ({ page }) => {
    await fakeSession(page, null);
    await fakeApi(page, "POST", "/api/auth/register", { status: 500 });
    const signUp = new SignUpPage(page);
    await signUp.open();

    await signUp.register(TENDAI_REGISTRATION);

    await expect(signUp.alert).toContainText("Something went wrong");
    await expect(signUp.alert).toContainText("Try again in a moment.");
  });

  test("shows a loading state while checking for an existing session", async ({ page }) => {
    const session = await fakeSession(page, null, { hold: true });
    const signUp = new SignUpPage(page);

    await signUp.open();

    await expect(signUp.loadingStatus).toBeVisible();
    session.release();
    await expect(signUp.displayName).toBeVisible();
  });

  test("sends a signed-in member home", async ({ page }) => {
    await fakeSession(page, TENDAI);
    const signUp = new SignUpPage(page);

    await signUp.open();

    await expect(page).toHaveURL("/");
    await expect(new HomePage(page).heading).toBeVisible();
  });
});
