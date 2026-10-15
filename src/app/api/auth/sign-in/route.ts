import { signIn } from "@/features/accounts/auth-service";
import { isSameOrigin } from "@/lib/csrf";
import { sessionCookieHeader } from "@/lib/session-cookie";
import { type FieldErrors, isEmail, text } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  const fieldErrors: FieldErrors = {};
  if (!isEmail(email)) fieldErrors.email = "Enter a valid email";
  if (!password) fieldErrors.password = "Enter your password";
  if (Object.keys(fieldErrors).length > 0) return Response.json({ fieldErrors }, { status: 400 });

  const result = await signIn(email, password);
  if (!result.ok) return new Response(null, { status: 401 });

  return Response.json(
    { displayName: result.displayName },
    { headers: { "set-cookie": sessionCookieHeader(result.token) } },
  );
}
