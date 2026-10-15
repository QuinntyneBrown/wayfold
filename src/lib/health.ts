/** 200 when the probe resolves, 503 with no detail when it throws (L2-021 AC1). */
export async function healthResponse(probe: () => Promise<unknown>) {
  try {
    await probe();
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
