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
