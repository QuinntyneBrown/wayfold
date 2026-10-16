import { currentMember } from "@/features/accounts/auth-service";
import { getVehicleDetail } from "@/features/marketplace/vehicle-detail-service";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>("/api/vehicles/[id]", async (request, { params }) => {
  const detail = await getVehicleDetail((await params).id, await currentMember(request));
  if (!detail) return new Response(null, { status: 404 });
  return Response.json(detail);
});
