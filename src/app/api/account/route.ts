import { eq } from "drizzle-orm";
import { currentMember } from "@/features/accounts/auth-service";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling("/api/account", async (request: Request) => {
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const [account] = await db
    .select({
      displayName: users.displayName,
      gtaArea: users.gtaArea,
      homeChurch: users.homeChurch,
      showHomeChurch: users.showHomeChurch,
    })
    .from(users)
    .where(eq(users.id, member.id));
  return Response.json(account);
});
