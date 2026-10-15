import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { DELETE, PATCH } from "@/app/api/garage-cars/[id]/route";
import { POST } from "@/app/api/garage-cars/route";
import { GET as getMember } from "@/app/api/members/[id]/route";
import { GET as getPhoto } from "@/app/api/photos/[id]/route";
import { APP_ORIGIN, registerMember, withId } from "./requests";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.from([0, 0, 0, 0]), Buffer.from("WEBP")]);

beforeAll(() => {
  process.env.UPLOADS_DIR = mkdtempSync(path.join(tmpdir(), "wayfold-uploads-"));
});

type Fields = Record<string, string | { bytes: Buffer; type: string; name?: string }>;

function form(fields: Fields) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string") data.set(key, value);
    else data.set(key, new File([new Uint8Array(value.bytes)], value.name ?? "photo", { type: value.type }));
  }
  return data;
}

function send(method: string, url: string, fields: Fields | null, { cookie, origin = APP_ORIGIN }: { cookie?: string; origin?: string | null } = {}) {
  const headers: Record<string, string> = {};
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  return new Request(`${APP_ORIGIN}${url}`, { method, headers, body: fields ? form(fields) : undefined });
}

const FIT = { year: "2015", make: "Honda", model: "Fit", nickname: "Bluebird", notes: "My reliable city runabout." };

const add = (fields: Fields, cookie?: string, origin?: string | null) => POST(send("POST", "/api/garage-cars", fields, { cookie, origin }));
const edit = (id: string, fields: Fields, cookie?: string) => PATCH(...routeArgs(id, "PATCH", fields, cookie));
const remove = (id: string, cookie?: string) => DELETE(...routeArgs(id, "DELETE", null, cookie));

function routeArgs(id: string, method: string, fields: Fields | null, cookie?: string) {
  return [send(method, `/api/garage-cars/${id}`, fields, { cookie }), { params: Promise.resolve({ id }) }] as const;
}

const garageOf = async (memberId: string, cookie: string) =>
  (await (await getMember(...withId(memberId, `/api/members/${memberId}`, { cookie }))).json()).garage;

describe("POST /api/garage-cars", () => {
  it("adds a car that appears in the owner's garage", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await add(FIT, tendai.cookie);

    expect(response.status).toBe(201);
    const car = await response.json();
    expect(car).toMatchObject({ year: 2015, make: "Honda", model: "Fit", nickname: "Bluebird", notes: "My reliable city runabout.", photoRef: null });
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([car]);
  });

  it("needs only a year, make and model", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await add({ year: "2015", make: "Honda", model: "Fit" }, tendai.cookie);

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ nickname: null, notes: null });
  });

  it("returns field errors and adds nothing for missing or invalid fields", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await add({ year: "", make: " ", model: "", nickname: "n".repeat(41), notes: "n".repeat(501) }, tendai.cookie);

    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors).toEqual({
      year: "Enter a year",
      make: "Enter a make",
      model: "Enter a model",
      nickname: "Use 40 characters or fewer",
      notes: "Use 500 characters or fewer",
    });
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([]);
  });

  it("rejects a year outside 1900 to next year", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    for (const year of ["1899", "abcd", String(new Date().getFullYear() + 2)]) {
      const response = await add({ ...FIT, year }, tendai.cookie);
      expect((await response.json()).fieldErrors.year).toBe("Enter a year");
    }
  });

  it("stores a JPEG, PNG or WebP photo and serves it back", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    for (const [bytes, type, extension] of [[JPEG, "image/jpeg", ".jpg"], [PNG, "image/png", ".png"], [WEBP, "image/webp", ".webp"]] as const) {
      const response = await add({ ...FIT, photo: { bytes, type } }, tendai.cookie);
      const car = await response.json();

      expect(response.status).toBe(201);
      expect(car.photoRef).toMatch(new RegExp(`^[0-9a-f-]{36}\\${extension}$`));
      const photo = await getPhoto(...withId(car.photoRef, `/api/photos/${car.photoRef}`));
      expect(photo.status).toBe(200);
      expect(photo.headers.get("content-type")).toBe(type);
      expect(Buffer.from(await photo.arrayBuffer())).toEqual(bytes);
    }
  });

  it("rejects a file that is not a supported image, whatever its name or type says", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    const response = await add({ ...FIT, photo: { bytes: Buffer.from("<script>alert(1)</script>"), type: "image/png", name: "x.png" } }, tendai.cookie);

    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.photo).toBe("Choose a JPEG, PNG or WebP image");
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([]);
  });

  it("rejects a photo over 5 MB", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);

    const response = await add({ ...FIT, photo: { bytes: big, type: "image/png" } }, tendai.cookie);

    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.photo).toBe("Use an image under 5 MB");
  });

  it("returns 401 without a session and 403 without a same-origin Origin", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");

    expect((await add(FIT)).status).toBe(401);
    expect((await add(FIT, tendai.cookie, null)).status).toBe(403);
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([]);
  });
});

describe("PATCH and DELETE /api/garage-cars/:id", () => {
  async function carOf(cookie: string) {
    return (await (await add(FIT, cookie)).json()) as { id: string };
  }

  it("lets the owner edit the car, and the garage reflects it", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await carOf(tendai.cookie);

    const response = await edit(car.id, { year: "2016", make: "Honda", model: "Fit EX" }, tendai.cookie);

    expect(response.status).toBe(200);
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([
      expect.objectContaining({ id: car.id, year: 2016, model: "Fit EX", nickname: null, notes: null }),
    ]);
  });

  it("keeps the photo unless a new one is sent, and replaces it when sent", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = (await (await add({ ...FIT, photo: { bytes: PNG, type: "image/png" } }, tendai.cookie)).json()) as { id: string; photoRef: string };

    await edit(car.id, FIT, tendai.cookie);
    expect((await garageOf(tendai.id, tendai.cookie))[0].photoRef).toBe(car.photoRef);

    await edit(car.id, { ...FIT, photo: { bytes: JPEG, type: "image/jpeg" } }, tendai.cookie);
    const [updated] = await garageOf(tendai.id, tendai.cookie);
    expect(updated.photoRef).not.toBe(car.photoRef);
    expect(updated.photoRef).toMatch(/\.jpg$/);
  });

  it("returns field errors and changes nothing for invalid fields", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await carOf(tendai.cookie);

    const response = await edit(car.id, { ...FIT, model: "" }, tendai.cookie);

    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors).toEqual({ model: "Enter a model" });
    expect((await garageOf(tendai.id, tendai.cookie))[0].model).toBe("Fit");
  });

  it("lets the owner remove the car and its photo file", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = (await (await add({ ...FIT, photo: { bytes: PNG, type: "image/png" } }, tendai.cookie)).json()) as { id: string; photoRef: string };
    const file = path.join(process.env.UPLOADS_DIR!, car.photoRef);
    expect(existsSync(file)).toBe(true);

    const response = await remove(car.id, tendai.cookie);

    expect(response.status).toBe(204);
    expect(await garageOf(tendai.id, tendai.cookie)).toEqual([]);
    expect(existsSync(file)).toBe(false);
  });

  it("answers 403 to another member and changes nothing", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const priya = await registerMember("Priya Nair", "priya@example.com");
    const car = await carOf(tendai.cookie);

    expect((await edit(car.id, { ...FIT, model: "Hacked" }, priya.cookie)).status).toBe(403);
    expect((await remove(car.id, priya.cookie)).status).toBe(403);
    expect((await garageOf(tendai.id, tendai.cookie))[0]).toMatchObject({ id: car.id, model: "Fit" });
  });

  it("answers 404 for an unknown car and 401 without a session", async () => {
    const tendai = await registerMember("Tendai Mensah", "tendai@example.com");
    const car = await carOf(tendai.cookie);

    expect((await edit("6f1d2c1e-0000-4000-8000-0000000000ff", FIT, tendai.cookie)).status).toBe(404);
    expect((await remove("not-an-id", tendai.cookie)).status).toBe(404);
    expect((await edit(car.id, FIT)).status).toBe(401);
    expect((await remove(car.id)).status).toBe(401);
  });
});

describe("GET /api/photos/:id", () => {
  it("answers 404 for an unknown or malformed reference, including path tricks", async () => {
    for (const id of ["6f1d2c1e-0000-4000-8000-0000000000ff.png", "../../package.json", "..%2F..%2Fpackage.json", "x"]) {
      expect((await getPhoto(...withId(id, `/api/photos/${id}`))).status).toBe(404);
    }
  });
});
