import { withErrorHandling } from "@/lib/with-error-handling";
import { signOut } from "@/features/accounts/auth-service";
import { isSameOrigin } from "@/lib/csrf";
import { clearedSessionCookieHeader } from "@/lib/session-cookie";

export const POST = withErrorHandling("/api/auth/sign-out", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });

  await signOut(request);

  return new Response(null, { status: 204, headers: { "set-cookie": clearedSessionCookieHeader() } });
});
