import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
type Extension = keyof typeof TYPES;

/** The photo reference format: an unguessable id and a known extension, so a reference can never name another path. */
const REFERENCE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

function uploadsDir() {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
}

/** Decides the image type from the file bytes; the file name and type the browser sends are not trusted. */
export function sniffImage(bytes: Uint8Array): Extension | null {
  const at = (offset: number, ...expected: number[]) => expected.every((byte, i) => bytes[offset + i] === byte);
  if (at(0, 0xff, 0xd8, 0xff)) return "jpg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "webp";
  return null;
}

export async function savePhoto(bytes: Uint8Array, extension: Extension) {
  const reference = `${randomUUID()}.${extension}`;
  await mkdir(uploadsDir(), { recursive: true });
  await writeFile(path.join(uploadsDir(), reference), bytes);
  return reference;
}

export async function deletePhoto(reference: string | null) {
  if (!reference || !REFERENCE.test(reference)) return;
  await unlink(path.join(uploadsDir(), reference)).catch(() => undefined);
}

export async function readPhoto(reference: string) {
  if (!REFERENCE.test(reference)) return null;
  const extension = reference.split(".")[1] as Extension;
  try {
    return { bytes: await readFile(path.join(uploadsDir(), reference)), type: TYPES[extension] };
  } catch {
    return null;
  }
}
