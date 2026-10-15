export const APP_ORIGIN = "http://localhost:3000";

type Options = { origin?: string | null; cookie?: string };

export function postJson(path: string, body: unknown, { origin = APP_ORIGIN, cookie }: Options = {}) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  return new Request(`${APP_ORIGIN}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
}

/** Parses the session cookie set by a response into its value and attributes. */
export function sessionCookie(response: Response) {
  const header = response.headers.get("set-cookie") ?? "";
  const [pair, ...attributes] = header.split(";").map((part) => part.trim());
  const [name, value] = pair.split("=");
  return { name, value, attributes: attributes.map((a) => a.toLowerCase()) };
}

export const TENDAI = { displayName: "Tendai Mensah", email: "tendai@example.com", password: "correct horse battery" };

/** Registers Tendai through the real route and returns the session cookie as a request header value. */
export async function registerTendai() {
  const { POST } = await import("@/app/api/auth/register/route");
  const { name, value } = sessionCookie(await POST(postJson("/api/auth/register", TENDAI)));
  return `${name}=${value}`;
}
