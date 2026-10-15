import { currentMember } from "@/features/accounts/auth-service";
import { feedFor } from "@/features/community/post-service";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling("/api/feed", async (request: Request) => {
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  return Response.json({ posts: await feedFor(member.id) });
});
