import { withErrorHandling } from "@/lib/with-error-handling";
import { currentMember, initialsOf } from "@/features/accounts/auth-service";

export const GET = withErrorHandling("/api/session", async (request: Request) => {
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  return Response.json({ ...member, initials: initialsOf(member.displayName) });
});
