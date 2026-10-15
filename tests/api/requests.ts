export const APP_ORIGIN = "http://localhost:3000";

type Options = { origin?: string | null; cookie?: string };

export function postJson(path: string, body: unknown, { origin = APP_ORIGIN, cookie }: Options = {}, method = "POST") {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  return new Request(`${APP_ORIGIN}${path}`, { method, headers, body: JSON.stringify(body) });
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

export type TestMember = { id: string; cookie: string };

/** Registers a member through the real route and returns their id and session cookie. */
export async function registerMember(displayName: string, email: string): Promise<TestMember> {
  const { POST } = await import("@/app/api/auth/register/route");
  const { name, value } = sessionCookie(
    await POST(postJson("/api/auth/register", { displayName, email, password: "correct horse battery" })),
  );
  const cookie = `${name}=${value}`;
  const { GET } = await import("@/app/api/session/route");
  const { id } = await (await GET(new Request(`${APP_ORIGIN}/api/session`, { headers: { cookie } }))).json();
  return { id, cookie };
}

/** Calls a route handler that takes a dynamic `[id]` segment, with an optional JSON body and session. */
export function withId(id: string, path: string, { method = "GET", body, cookie, origin = APP_ORIGIN }: {
  method?: string;
  body?: unknown;
  cookie?: string;
  origin?: string | null;
} = {}) {
  const headers: Record<string, string> = {};
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers["content-type"] = "application/json";
  const request = new Request(`${APP_ORIGIN}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return [request, { params: Promise.resolve({ id }) }] as const;
}
