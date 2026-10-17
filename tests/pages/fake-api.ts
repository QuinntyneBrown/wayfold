import type { Page, Request } from "@playwright/test";

export type FakeResponse = { status: number; json?: unknown };
export type Member = { id: string; displayName: string; initials: string };

/**
 * Answers one API endpoint from the browser, so no backend runs during e2e tests.
 * With `hold: true` the answer waits until `release()` is called, to observe busy states.
 */
export async function fakeApi(
  page: Page,
  method: string,
  path: string,
  response: FakeResponse,
  { hold = false } = {},
) {
  const requests: Request[] = [];
  let release!: () => void;
  const released = hold ? new Promise<void>((resolve) => (release = resolve)) : Promise.resolve();

  await page.route(`**${path}`, async (route) => {
    if (route.request().method() !== method) return route.fallback();
    requests.push(route.request());
    await released;
    await route.fulfill(
      response.json === undefined ? { status: response.status } : { status: response.status, json: response.json },
    );
  });

  return {
    release: () => release?.(),
    lastBody: () => requests.at(-1)?.postDataJSON(),
    lastText: () => requests.at(-1)?.postData() ?? "",
    lastUrl: () => requests.at(-1)?.url() ?? "",
    callCount: () => requests.length,
  };
}

/** The signed-in member the shell asks for, or `null` for a signed-out visitor. */
export function fakeSession(page: Page, member: Member | null, options?: { hold?: boolean }) {
  return fakeApi(page, "GET", "/api/session", member ? { status: 200, json: member } : { status: 401 }, options);
}

export const TENDAI: Member = { id: "6f1d2c1e-0000-4000-8000-000000000001", displayName: "Tendai Mensah", initials: "TM" };

export type AccountSettings = {
  displayName: string;
  gtaArea: string | null;
  homeChurch: string | null;
  showHomeChurch: boolean;
};

export const TENDAI_SETTINGS: AccountSettings = {
  displayName: "Tendai Mensah",
  gtaArea: "Toronto",
  homeChurch: "Lakeshore Fellowship",
  showHomeChurch: true,
};

export type MemberProfile = {
  id: string;
  displayName: string;
  gtaArea: string | null;
  bio: string | null;
  homeChurch?: string;
  followers: number;
  following: boolean;
  isOwner: boolean;
  garage: unknown[];
  posts: unknown[];
  listings: unknown[];
  recommendations: unknown[];
};

export const PRIYA: MemberProfile = {
  id: "6f1d2c1e-0000-4000-8000-000000000002",
  displayName: "Priya Nair",
  gtaArea: "Etobicoke",
  bio: "Keeping good cars on the road and helping neighbours find honest service.",
  homeChurch: "Lakeshore Fellowship",
  followers: 32,
  following: false,
  isOwner: false,
  garage: [],
  posts: [],
  listings: [],
  recommendations: [],
};

/** Makes one API endpoint fail at the network level, as when the connection drops. */
export async function fakeNetworkFailure(page: Page, method: string, path: string) {
  await page.route(`**${path}`, (route) => (route.request().method() === method ? route.abort("connectionfailed") : route.fallback()));
}

export type FeedPost = {
  id: string;
  topic: string;
  text: string;
  createdAt: string;
  author: { id: string; displayName: string; gtaArea: string | null; homeChurch?: string };
  likes: number;
  liked: boolean;
  comments: { id: string; text: string; createdAt: string; author: { id: string; displayName: string } }[];
  mine: boolean;
};

export const PRIYA_POST: FeedPost = {
  id: "6f1d2c1e-0000-4000-8000-0000000000a1",
  topic: "For sale",
  text: "2019 RAV4 XLE, well cared for and ready for another GTA family.",
  createdAt: "2026-10-14T15:00:00.000Z",
  author: { id: PRIYA.id, displayName: "Priya Nair", gtaArea: "Etobicoke", homeChurch: "Lakeshore Fellowship" },
  likes: 12,
  liked: false,
  comments: [
    { id: "6f1d2c1e-0000-4000-8000-0000000000b1", text: "Beautiful car", createdAt: "2026-10-14T16:00:00.000Z", author: { id: TENDAI.id, displayName: "Tendai Mensah" } },
  ],
  mine: false,
};

export const TENDAI_POST: FeedPost = {
  id: "6f1d2c1e-0000-4000-8000-0000000000a2",
  topic: "My car",
  text: "Bluebird made it through another winter.",
  createdAt: "2026-10-13T15:00:00.000Z",
  author: { id: TENDAI.id, displayName: "Tendai Mensah", gtaArea: "Toronto" },
  likes: 8,
  liked: true,
  comments: [],
  mine: true,
};

export type VehicleCardData = {
  id: string;
  title: string;
  price: number;
  year: number;
  make: string;
  model: string;
  mileage: number;
  municipality: string;
  sellerType: "private" | "dealer";
  sellerName: string;
  photoRef: string | null;
};

export const RAV4: VehicleCardData = {
  id: "6f1d2c1e-0000-4000-8000-0000000000v1",
  title: "2019 Toyota RAV4 XLE",
  price: 29500,
  year: 2019,
  make: "Toyota",
  model: "RAV4",
  mileage: 71000,
  municipality: "Etobicoke",
  sellerType: "private",
  sellerName: "Priya Nair",
  photoRef: "rav4.jpg",
};

export const CIVIC: VehicleCardData = {
  id: "6f1d2c1e-0000-4000-8000-0000000000v2",
  title: "2021 Honda Civic Sport",
  price: 24995,
  year: 2021,
  make: "Honda",
  model: "Civic",
  mileage: 48200,
  municipality: "Scarborough",
  sellerType: "dealer",
  sellerName: "Eglinton Auto Group",
  photoRef: null,
};

export function vehiclesResult(items: VehicleCardData[], total = items.length, page = 1) {
  return { status: 200, json: { items, total, page, pageSize: 20 } };
}

export type VehicleDetailData = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  condition: string | null;
  description: string;
  features: string[];
  municipality: string;
  status: "published" | "sold";
  photos: string[];
  seller: { sellerType: "private" | "dealer"; name: string; profilePath: string; homeChurch?: string; canMessage: boolean };
};

export const RAV4_DETAIL: VehicleDetailData = {
  id: RAV4.id,
  title: RAV4.title,
  year: 2019,
  make: "Toyota",
  model: "RAV4",
  price: 29500,
  mileage: 71000,
  condition: "Used",
  description: "Regular service, clean interior and ready for a test drive.",
  features: ["Heated seats", "Backup camera"],
  municipality: "Etobicoke",
  status: "published",
  photos: ["rav4.jpg"],
  seller: { sellerType: "private", name: "Priya Nair", profilePath: "/members/6f1d2c1e-0000-4000-8000-000000000002", homeChurch: "Lakeshore Fellowship", canMessage: true },
};

export const CIVIC_DETAIL: VehicleDetailData = {
  id: CIVIC.id,
  title: CIVIC.title,
  year: 2021,
  make: "Honda",
  model: "Civic",
  price: 24995,
  mileage: 48200,
  condition: "Used",
  description: "Certified pre-owned with a full inspection.",
  features: [],
  municipality: "Scarborough",
  status: "published",
  photos: [],
  seller: { sellerType: "dealer", name: "Eglinton Auto Group", profilePath: "/providers/6f1d2c1e-0000-4000-8000-0000000000d1", canMessage: true },
};

export type ProviderDetailData = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  municipality: string;
  description: string;
  contactEmail: string;
  phone: string | null;
  isOwner: boolean;
  ownerChurch?: string;
};

export const DANFORTH: ProviderDetailData = {
  id: "6f1d2c1e-0000-4000-8000-0000000000d1",
  name: "Danforth Auto Care",
  category: "mechanic",
  categoryLabel: "Mechanic",
  municipality: "Toronto",
  description: "Honest repairs and clear explanations for Toronto drivers.",
  contactEmail: "hello@danforthautocare.example",
  phone: "416-555-0123",
  isOwner: false,
};
