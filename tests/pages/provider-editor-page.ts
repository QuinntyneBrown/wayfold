import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export type BusinessForm = {
  name: string;
  category: string;
  municipality: string;
  description: string;
  contactEmail: string;
  phone?: string;
};

export class ProviderEditorPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open() {
    await this.page.goto("/providers/new");
  }

  async openEdit(id: string) {
    await this.page.goto(`/providers/${id}/edit`);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get name() {
    return this.page.getByLabel("Business or professional name");
  }

  get category() {
    return this.page.getByLabel("Category");
  }

  get municipality() {
    return this.page.getByLabel("GTA municipality");
  }

  get description() {
    return this.page.getByLabel("What do you do?");
  }

  get contactEmail() {
    return this.page.getByLabel("Contact email");
  }

  get phone() {
    return this.page.getByLabel("Phone (optional)");
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /^(Save business profile|Save changes|Saving…)$/ });
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get tryAgain() {
    return this.page.getByRole("button", { name: "Try again" });
  }

  get alert() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get viewProfile() {
    return this.page.getByRole("link", { name: "View provider profile" });
  }

  async categoryOptions() {
    return this.category.locator("option").allInnerTexts();
  }

  async municipalityOptions() {
    return this.municipality.locator("option").allInnerTexts();
  }

  async fill(form: BusinessForm) {
    await this.name.fill(form.name);
    await this.category.selectOption({ label: form.category });
    await this.municipality.selectOption(form.municipality);
    await this.description.fill(form.description);
    await this.contactEmail.fill(form.contactEmail);
    if (form.phone) await this.phone.fill(form.phone);
  }

  async save() {
    await this.saveButton.click();
  }

  async hasHorizontalScroll() {
    return this.shell.scrollsHorizontally();
  }
}
