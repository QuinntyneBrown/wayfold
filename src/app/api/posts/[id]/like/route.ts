import { currentMember } from "@/features/accounts/auth-service";
import { findPost, toggleLike } from "@/features/community/post-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Context>("/api/posts/[id]/like", async (request, { params }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const post = await findPost((await params).id);
  if (!post) return new Response(null, { status: 404 });

  return Response.json(await toggleLike(post.id, member.id));
});
