import { expect, test } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { NotFoundPage } from "../pages/not-found-page";

test.describe("Page not found", () => {
  test("answers an unknown address with 404, a generic message and a way home", async ({ page }) => {
    const notFound = new NotFoundPage(page);

    const response = await notFound.open("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(notFound.heading).toHaveText("Page not found");
    await expect(notFound.message).toBeVisible();
    expect(await notFound.shell.accessibilityViolations()).toEqual([]);

    await notFound.goHomeLink.click();

    await expect(new HomePage(page).heading).toHaveText("Find your people in the GTA auto community");
  });
});
