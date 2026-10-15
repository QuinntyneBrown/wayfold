import { currentMember, initialsOf } from "@/features/accounts/auth-service";

export async function GET(request: Request) {
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  return Response.json({ ...member, initials: initialsOf(member.displayName) });
}
