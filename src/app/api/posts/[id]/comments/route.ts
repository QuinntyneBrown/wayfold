import { currentMember } from "@/features/accounts/auth-service";
import { addComment, findPost } from "@/features/community/post-service";
import { isSameOrigin } from "@/lib/csrf";
import { text } from "@/lib/validation";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Context>("/api/posts/[id]/comments", async (request, { params }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const post = await findPost((await params).id);
  if (!post) return new Response(null, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const content = text(body.text);
  if (!content) return Response.json({ fieldErrors: { text: "Write a comment" } }, { status: 400 });
  if (content.length > 500) return Response.json({ fieldErrors: { text: "Use 500 characters or fewer" } }, { status: 400 });

  return Response.json(await addComment(post.id, member.id, content), { status: 201 });
});
