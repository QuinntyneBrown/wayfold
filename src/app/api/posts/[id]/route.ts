import { currentMember } from "@/features/accounts/auth-service";
import { deletePost, findPost } from "@/features/community/post-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandling<Context>("/api/posts/[id]", async (request, { params }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const post = await findPost((await params).id);
  if (!post) return new Response(null, { status: 404 });
  if (post.authorId !== member.id) return new Response(null, { status: 403 });

  await deletePost(post.id);
  return new Response(null, { status: 204 });
});
