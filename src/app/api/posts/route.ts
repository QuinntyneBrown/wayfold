import { currentMember } from "@/features/accounts/auth-service";
import { createPost } from "@/features/community/post-service";
import { TOPICS } from "@/features/community/topics";
import { isSameOrigin } from "@/lib/csrf";
import { type FieldErrors, text } from "@/lib/validation";
import { withErrorHandling } from "@/lib/with-error-handling";

export const POST = withErrorHandling("/api/posts", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const topic = text(body.topic);
  const content = text(body.text);

  const fieldErrors: FieldErrors = {};
  if (!(TOPICS as readonly string[]).includes(topic)) fieldErrors.topic = "Choose a topic";
  if (!content) fieldErrors.text = "Write something to share";
  else if (content.length > 1000) fieldErrors.text = "Use 1000 characters or fewer";
  if (Object.keys(fieldErrors).length > 0) return Response.json({ fieldErrors }, { status: 400 });

  return Response.json(await createPost(member.id, topic, content), { status: 201 });
});
