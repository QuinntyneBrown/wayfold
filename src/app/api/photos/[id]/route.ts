import { readPhoto } from "@/features/garage/photo-store";
import { withErrorHandling } from "@/lib/with-error-handling";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Context>("/api/photos/[id]", async (_request, { params }) => {
  const photo = await readPhoto((await params).id);
  if (!photo) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: {
      "content-type": photo.type,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
});
