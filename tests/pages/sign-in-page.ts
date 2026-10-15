import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class SignInPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open() {
    await this.page.goto("/sign-in");
  }

  get email() {
    return this.page.getByLabel("Email");
  }

  get password() {
    return this.page.getByLabel("Password");
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Sign in|Signing in/ });
  }

  get alert() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get createAccountLink() {
    return this.page.getByRole("link", { name: "Create an account" });
  }

  get primaryNav() {
    return this.page.getByRole("navigation", { name: "Primary" });
  }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
