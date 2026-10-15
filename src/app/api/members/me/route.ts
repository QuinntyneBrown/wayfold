import { currentMember } from "@/features/accounts/auth-service";
import { saveBio } from "@/features/community/profile-service";
import { isSameOrigin } from "@/lib/csrf";
import { text } from "@/lib/validation";
import { withErrorHandling } from "@/lib/with-error-handling";

export const PATCH = withErrorHandling("/api/members/me", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const bio = text(body.bio);
  if (bio.length > 500) return Response.json({ fieldErrors: { bio: "Use 500 characters or fewer" } }, { status: 400 });

  await saveBio(member.id, bio || null);
  return new Response(null, { status: 200 });
});
