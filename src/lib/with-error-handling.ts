import { log } from "./logger";

type Handler = (request: Request) => Promise<Response>;

/** Gives the request an id, echoes it back, and turns an unexpected error into a logged generic 500 (L2-021). */
export function withErrorHandling(route: string, handler: Handler): Handler {
  return async (request) => {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    try {
      const response = await handler(request);
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      log("error", {
        requestId,
        event: "unhandled_error",
        route,
        status: 500,
        error: error instanceof Error ? error.name : "unknown",
      });
      return Response.json(
        { error: "Something went wrong", requestId },
        { status: 500, headers: { "x-request-id": requestId } },
      );
    }
  };
}
