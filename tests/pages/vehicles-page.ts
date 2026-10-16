import type { Page } from "@playwright/test";
import { SiteShell } from "./site-shell";

export class VehiclesPage {
  readonly shell: SiteShell;

  constructor(private readonly page: Page) {
    this.shell = new SiteShell(page);
  }

  async open(query = "") {
    await this.page.goto(`/vehicles${query}`);
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }

  get search() {
    return this.page.getByRole("search");
  }

  get loadingStatus() {
    return this.page.getByRole("status").filter({ hasText: "Loading" });
  }

  get resultCount() {
    return this.page.getByRole("status").filter({ hasText: "Newest first" });
  }

  get cards() {
    return this.page.getByRole("main").getByRole("list").getByRole("listitem");
  }

  card(title: string) {
    return this.cards.filter({ hasText: title });
  }

  cardLink(title: string) {
    return this.card(title).getByRole("link", { name: title });
  }

  get loadError() {
    return this.page.getByRole("main").getByRole("alert");
  }

  get tryAgain() {
    return this.page.getByRole("button", { name: "Try again" });
  }

  get emptyMessage() {
    return this.page.getByRole("heading", { name: "No vehicles listed yet" });
  }

  get noResults() {
    return this.page.getByRole("heading", { name: "No matches" });
  }

  get clearFilters() {
    return this.page.getByRole("link", { name: "Clear filters" });
  }

  get keyword() {
    return this.search.getByLabel("Search vehicles");
  }

  get sellerType() {
    return this.search.getByLabel("Seller type");
  }

  get make() {
    return this.search.getByLabel("Make");
  }

  get model() {
    return this.search.getByLabel("Model");
  }

  get minPrice() {
    return this.search.getByLabel("Min price");
  }

  get maxPrice() {
    return this.search.getByLabel("Max price");
  }

  get municipality() {
    return this.search.getByLabel("GTA municipality");
  }

  get fieldErrors() {
    return this.search.locator(".field__error");
  }

  get searchButton() {
    return this.search.getByRole("button", { name: "Search" });
  }

  get pagination() {
    return this.page.getByRole("navigation", { name: "Pagination" });
  }

  get pageStatus() {
    return this.pagination.getByRole("status");
  }

  get next() {
    return this.pagination.getByRole("link", { name: "Next" });
  }

  get previous() {
    return this.pagination.getByRole("link", { name: "Previous" });
  }
}
