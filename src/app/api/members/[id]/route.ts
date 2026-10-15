import { currentMember } from "@/features/accounts/auth-service";
import { loadProfile } from "@/features/community/profile-service";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>("/api/members/[id]", async (request, { params }) => {
  const viewer = await currentMember(request);
  if (!viewer) return new Response(null, { status: 401 });

  const profile = await loadProfile((await params).id, viewer.id);
  return profile ? Response.json(profile) : new Response(null, { status: 404 });
});
