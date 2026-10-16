import { currentMember } from "@/features/accounts/auth-service";
import { MAX_INQUIRY_LENGTH, sendInquiry } from "@/features/marketplace/inquiry-service";
import { isSameOrigin } from "@/lib/csrf";
import { type FieldErrors, text } from "@/lib/validation";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Context>("/api/vehicles/[id]/inquiries", async (request, { params }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const message = text(body.message);
  const fieldErrors: FieldErrors = {};
  if (!message) fieldErrors.message = "Write a message";
  else if (message.length > MAX_INQUIRY_LENGTH) fieldErrors.message = `Use ${MAX_INQUIRY_LENGTH} characters or fewer`;
  if (Object.keys(fieldErrors).length > 0) return Response.json({ fieldErrors }, { status: 400 });

  const outcome = await sendInquiry(member.id, (await params).id, message);
  if (outcome === "not-found") return new Response(null, { status: 404 });
  if (outcome === "own-listing") return new Response(null, { status: 403 });
  return new Response(null, { status: 201 });
});
