import { log } from "./logger";

type Handler<Context> = (request: Request, context: Context) => Promise<Response>;
type Route<Context> = (request: Request, context?: Context) => Promise<Response>;

/** Gives the request an id, echoes it back, and turns an unexpected error into a logged generic 500 (L2-021). */
export function withErrorHandling<Context = unknown>(route: string, handler: Handler<Context>): Route<Context> {
  return async (request, context) => {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    try {
      const response = await handler(request, context as Context);
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
