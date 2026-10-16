import { currentMember } from "@/features/accounts/auth-service";
import { getProviderDetail, parseProvider, updateProvider } from "@/features/providers/provider-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>("/api/providers/[id]", async (request, { params }) => {
  const detail = await getProviderDetail((await params).id, await currentMember(request));
  if (!detail) return new Response(null, { status: 404 });
  return Response.json(detail);
});

export const PUT = withErrorHandling<Context>("/api/providers/[id]", async (request, { params }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const parsed = parseProvider(await request.json().catch(() => ({})));
  if (!parsed.ok) return Response.json({ fieldErrors: parsed.fieldErrors }, { status: 400 });

  const outcome = await updateProvider(member.id, (await params).id, parsed.input);
  if (outcome === "not-found") return new Response(null, { status: 404 });
  if (outcome === "forbidden") return new Response(null, { status: 403 });
  return new Response(null, { status: 200 });
});
