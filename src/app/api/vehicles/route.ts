import { searchVehicles } from "@/features/marketplace/vehicle-search-service";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling("/api/vehicles", async (request: Request) => {
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1") || 1;
  return Response.json(await searchVehicles(page));
});
