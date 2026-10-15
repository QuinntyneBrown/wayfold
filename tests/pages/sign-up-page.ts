import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export type Registration = { displayName: string; email: string; password: string };

export class SignUpPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open() {
    await this.page.goto("/sign-up");
  }

  get displayName() {
    return this.page.getByLabel("Display name");
  }

  get email() {
    return this.page.getByLabel("Email");
  }

  get password() {
    return this.page.getByLabel("Password");
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Create account|Creating account/ });
  }

  get alert() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get successHeading() {
    return this.page.getByRole("heading", { name: "You're in" });
  }

  get primaryNav() {
    return this.page.getByRole("navigation", { name: "Primary" });
  }

  async register({ displayName, email, password }: Registration) {
    await this.displayName.fill(displayName);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
