import { withErrorHandling } from "@/lib/with-error-handling";
import { register } from "@/features/accounts/registration-service";
import { isSameOrigin } from "@/lib/csrf";
import { sessionCookieHeader } from "@/lib/session-cookie";
import { type FieldErrors, isEmail, text } from "@/lib/validation";

export const POST = withErrorHandling("/api/auth/register", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const displayName = text(body.displayName);
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  const fieldErrors: FieldErrors = {};
  if (!displayName) fieldErrors.displayName = "Enter your name";
  if (!isEmail(email)) fieldErrors.email = "Enter a valid email";
  if (password.length < 12) fieldErrors.password = "Use at least 12 characters";
  if (Object.keys(fieldErrors).length > 0) return Response.json({ fieldErrors }, { status: 400 });

  const result = await register({ displayName, email, password });
  if (!result.ok) return new Response(null, { status: 409 });

  return Response.json(
    { displayName },
    { status: 201, headers: { "set-cookie": sessionCookieHeader(result.token) } },
  );
});
