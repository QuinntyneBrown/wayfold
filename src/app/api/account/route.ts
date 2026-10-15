import { eq } from "drizzle-orm";
import { isCurrentPassword, updateAccount } from "@/features/accounts/account-service";
import { currentMember } from "@/features/accounts/auth-service";
import { readSessionToken, sessionIdFor } from "@/lib/session-cookie";
import { isSameOrigin } from "@/lib/csrf";
import { isGtaArea } from "@/lib/gta-areas";
import { type FieldErrors, text } from "@/lib/validation";
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

export const PUT = withErrorHandling("/api/account", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const displayName = text(body.displayName);
  const gtaArea = text(body.gtaArea);
  const homeChurch = text(body.homeChurch);
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const fieldErrors: FieldErrors = {};
  if (!displayName) fieldErrors.displayName = "Enter your name";
  if (gtaArea && !isGtaArea(gtaArea)) fieldErrors.gtaArea = "Choose an area from the list";
  if (homeChurch.length > 80) fieldErrors.homeChurch = "Use 80 characters or fewer";
  if (newPassword && newPassword.length < 12) fieldErrors.newPassword = "Use at least 12 characters";
  if (newPassword && !currentPassword) fieldErrors.currentPassword = "Enter your current password";
  if (Object.keys(fieldErrors).length === 0 && newPassword && !(await isCurrentPassword(member.id, currentPassword))) {
    fieldErrors.currentPassword = "Your current password is incorrect";
  }
  if (Object.keys(fieldErrors).length > 0) return Response.json({ fieldErrors }, { status: 400 });

  await updateAccount(
    member.id,
    {
      displayName,
      gtaArea: gtaArea || null,
      homeChurch: homeChurch || null,
      showHomeChurch: body.showHomeChurch === true,
    },
    newPassword
      ? { current: currentPassword, next: newPassword, keepSessionId: sessionIdFor(readSessionToken(request)!) }
      : undefined,
  );
  return new Response(null, { status: 200 });
});
