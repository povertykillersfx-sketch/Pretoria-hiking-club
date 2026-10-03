import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { isAuthenticated } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file received" }, { status: 400 });
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return Response.json(
      { error: "Upload a JPG, PNG, WebP or AVIF image." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Images must be smaller than 8MB." }, { status: 413 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const filename = `${safeName || "photo"}-${randomBytes(4).toString("hex")}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return Response.json({ url: `/uploads/${filename}` });
}
