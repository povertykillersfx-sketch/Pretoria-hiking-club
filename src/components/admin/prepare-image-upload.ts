const MAX_EDGE = 1920;
const MAX_BYTES = 3 * 1024 * 1024;
const SAFE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function scale(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function loadHtmlImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "This phone photo format is not supported. Switch the photo to JPG or take a new one.",
        ),
      );
    };
    image.src = url;
  });
}

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // iPhone HEIC sometimes needs the <img> path.
      }
    }
  }
  return loadHtmlImage(file);
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress that photo. Try another image."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function alreadyFits(file: File): boolean {
  return SAFE_TYPES.has(file.type) && file.size <= MAX_BYTES;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (alreadyFits(file)) {
    return file;
  }

  try {
    const source = await decodeImage(file);
    const { width, height } = scale(source.width, source.height, MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare that photo. Try again.");
    }
    context.drawImage(source, 0, 0, width, height);
    if ("close" in source && typeof source.close === "function") {
      source.close();
    }

    let quality = 0.84;
    let blob = await canvasToJpeg(canvas, quality);
    while (blob.size > MAX_BYTES && quality > 0.5) {
      quality -= 0.08;
      blob = await canvasToJpeg(canvas, quality);
    }

    if (blob.size > MAX_BYTES) {
      throw new Error("That photo is still too large. Try a closer crop or another shot.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch (error) {
    if (file.size <= MAX_BYTES && /\.jpe?g$/i.test(file.name)) {
      return new File([file], file.name, { type: "image/jpeg" });
    }
    throw error instanceof Error
      ? error
      : new Error("Could not prepare that photo. Try a JPG instead.");
  }
}
