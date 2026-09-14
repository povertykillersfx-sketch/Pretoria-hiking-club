import fs from "node:fs";
import path from "node:path";

const IMAGE_PATTERN = /\.(jpe?g|png|webp|avif)$/i;

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

export function getImageLibrary(): string[] {
  return [...listDirectory("uploads", "/uploads"), ...listDirectory("images", "/images")];
}
