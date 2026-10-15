import { currentMember } from "@/features/accounts/auth-service";
import { addCar, parseCar, storePhoto } from "@/features/garage/garage-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

export const POST = withErrorHandling("/api/garage-cars", async (request: Request) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ fieldErrors: { year: "Enter a year" } }, { status: 400 });
  const parsed = parseCar(form);
  if (!parsed.ok) return Response.json({ fieldErrors: parsed.fieldErrors }, { status: 400 });

  let photoRef: string | null = null;
  if (parsed.photo) {
    const stored = await storePhoto(parsed.photo);
    if (!stored.ok) return Response.json({ fieldErrors: { photo: stored.error } }, { status: 400 });
    photoRef = stored.ref;
  }
  return Response.json(await addCar(member.id, parsed.fields, photoRef), { status: 201 });
});
