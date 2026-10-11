import fs from "node:fs";
import path from "node:path";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";

const IMAGE_PATTERN = /\.(jpe?g|png|webp|avif)$/i;
const BUCKET = "hike-photos";

function listDirectory(directory: string, prefix: string): string[] {
  const absolute = path.join(process.cwd(), "public", directory);

  try {
    return fs
      .readdirSync(absolute)
      .filter((file) => IMAGE_PATTERN.test(file))
      .sort()
      .map((file) => `${prefix}/${file}`);
  } catch {
    return [];
  }
}

async function listUploadedPhotos(): Promise<string[]> {
  if (!supabaseConfigured()) return listDirectory("uploads", "/uploads");

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 80, sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) return listDirectory("uploads", "/uploads");

    return data
      .filter((file) => IMAGE_PATTERN.test(file.name))
      .map((file) => supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl);
  } catch {
    return listDirectory("uploads", "/uploads");
  }
}

export function absoluteMediaUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  const pathName = src.startsWith("/") ? src : `/${src}`;
  return `${site.url}${pathName}`;
}

export async function getImageLibrary(): Promise<string[]> {
  const uploaded = await listUploadedPhotos();
  return [...uploaded, ...listDirectory("images", "/images")];
}
