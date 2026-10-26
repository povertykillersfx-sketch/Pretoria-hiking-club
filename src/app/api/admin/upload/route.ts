import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { isAuthenticated } from "@/lib/auth";
import { sniffImageType } from "@/lib/image-type";
import { getSupabase, supabaseConfigured, throwSupabaseError } from "@/lib/supabase";

/** Stay under Vercel Hobby's ~4.5MB request body limit (multipart adds overhead). */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const BUCKET = "hike-photos";

function fileNameFor(originalName: string, extension: string): string {
  const safeName = originalName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${safeName || "photo"}-${randomBytes(4).toString("hex")}.${extension}`;
}

async function uploadToSupabase(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const supabase = getSupabase();

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throwSupabaseError(createError);
    }
  }

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throwSupabaseError(error);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

async function uploadLocally(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "That photo is too large. Try another shot from your camera roll." },
      { status: 413 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file received" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Images must be smaller than 4MB. Try another shot — phone photos are shrunk automatically." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);

  if (sniffed === "image/heic") {
    return Response.json(
      {
        error:
          "iPhone HEIC photos need to be saved as JPG. Try Upload from device again, or choose Most Compatible in Camera settings.",
      },
      { status: 415 },
    );
  }

  const contentType =
    (sniffed && ALLOWED.has(sniffed) ? sniffed : undefined) ??
    (ALLOWED.has(file.type) ? file.type : undefined);
  const extension = contentType ? ALLOWED.get(contentType) : undefined;

  if (!contentType || !extension) {
    return Response.json(
      { error: "Upload a JPG, PNG, WebP or AVIF image." },
      { status: 415 },
    );
  }

  const filename = fileNameFor(file.name, extension);

  try {
    const url = supabaseConfigured()
      ? await uploadToSupabase(buffer, filename, contentType)
      : await uploadLocally(buffer, filename);
    return Response.json({ url });
  } catch (error) {
    console.error("[upload]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save that photo. Try again or pick a smaller file.",
      },
      { status: 500 },
    );
  }
}
