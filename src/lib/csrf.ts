/** CSRF defence for state-changing requests: the browser-sent Origin must be this app's own origin. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
