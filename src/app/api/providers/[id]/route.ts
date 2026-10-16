import { currentMember } from "@/features/accounts/auth-service";
import { getProviderDetail } from "@/features/providers/provider-service";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>("/api/providers/[id]", async (request, { params }) => {
  const detail = await getProviderDetail((await params).id, await currentMember(request));
  if (!detail) return new Response(null, { status: 404 });
  return Response.json(detail);
});
