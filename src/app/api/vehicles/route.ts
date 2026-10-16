import { parseSearch, searchVehicles } from "@/features/marketplace/vehicle-search-service";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling("/api/vehicles", async (request: Request) => {
  const parsed = parseSearch(new URL(request.url).searchParams);
  if (!parsed.ok) return Response.json({ fieldErrors: parsed.fieldErrors }, { status: 400 });
  return Response.json(await searchVehicles(parsed.query));
});
