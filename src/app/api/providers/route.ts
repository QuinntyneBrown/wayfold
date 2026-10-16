import { currentMember } from "@/features/accounts/auth-service";
import { createProvider, parseProvider } from "@/features/providers/provider-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

export const POST = withErrorHandling("/api/providers", async (request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const parsed = parseProvider(await request.json().catch(() => ({})));
  if (!parsed.ok) return Response.json({ fieldErrors: parsed.fieldErrors }, { status: 400 });

  return Response.json({ id: await createProvider(member.id, parsed.input) }, { status: 201 });
});
