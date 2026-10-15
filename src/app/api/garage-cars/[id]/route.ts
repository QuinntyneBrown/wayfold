import { currentMember } from "@/features/accounts/auth-service";
import { editCar, findCar, parseCar, removeCar, storePhoto } from "@/features/garage/garage-service";
import { isSameOrigin } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };
type OwnedCar = NonNullable<Awaited<ReturnType<typeof findCar>>>;

/** Runs `act` for the owner of the car: 403 cross-origin, 401 visitor, 404 unknown car, 403 another member's car. */
async function asOwner(request: Request, { params }: Context, act: (car: OwnedCar) => Promise<Response>) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const member = await currentMember(request);
  if (!member) return new Response(null, { status: 401 });
  const car = await findCar((await params).id);
  if (!car) return new Response(null, { status: 404 });
  if (car.ownerId !== member.id) return new Response(null, { status: 403 });
  return act(car);
}

export const PATCH = withErrorHandling<Context>("/api/garage-cars/[id]", (request, context) =>
  asOwner(request, context, async (car) => {
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
    return Response.json(await editCar(car.id, parsed.fields, photoRef, car.photoRef));
  }),
);

export const DELETE = withErrorHandling<Context>("/api/garage-cars/[id]", (request, context) =>
  asOwner(request, context, async (car) => {
    await removeCar(car.id, car.photoRef);
    return new Response(null, { status: 204 });
  }),
);
