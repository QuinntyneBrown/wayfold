import { currentMember } from "@/features/accounts/auth-service";
import { setFollowing } from "@/features/community/follow-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

function change(route: string, following: boolean) {
  return withErrorHandling<Context>(route, async (request, { params }) => {
    if (!isSameOrigin(request)) return new Response(null, { status: 403 });
    const member = await currentMember(request);
    if (!member) return new Response(null, { status: 401 });

    const result = await setFollowing(member.id, (await params).id, following);
    if (result.ok) return Response.json({ followers: result.followers });
    return new Response(null, { status: result.reason === "self" ? 400 : 404 });
  });
}

export const POST = change("/api/members/[id]/follow", true);
export const DELETE = change("/api/members/[id]/follow", false);
