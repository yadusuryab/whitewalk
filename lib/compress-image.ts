// lib/compress-image.ts
const MAX_PIXELS = 16_000_000; // safe for iOS Safari

async function loadSource(file: File): Promise<{ src: CanvasImageSource; w: number; h: number; close: () => void }> {
  try {
    const bmp = await createImageBitmap(file);
    return { src: bmp, w: bmp.width, h: bmp.height, close: () => bmp.close() };
  } catch {
    // Fallback for formats createImageBitmap can't handle
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return { src: img, w: img.naturalWidth, h: img.naturalHeight, close: () => {} };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, q: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, type, q);
    } catch {
      resolve(null);
    }
  });
}

export async function compressImage(
  file: File,
  maxW = 1000,
  maxH = 4000, // limits tall screenshots
  q = 0.7
): Promise<File> {
  try {
    const { src, w, h, close } = await loadSource(file);
    if (!w || !h) return file;

    let scale = Math.min(1, maxW / w, maxH / h);
    // Hard safety cap on total pixels
    if (w * scale * h * scale > MAX_PIXELS) {
      scale = Math.sqrt(MAX_PIXELS / (w * h));
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      close();
      return file;
    }
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    close();

    // Try WebP first, then JPEG (Safari doesn't encode WebP)
    for (const type of ["image/webp", "image/jpeg"]) {
      const blob = await toBlob(canvas, type, q);
      if (blob && blob.type === type) {
        const ext = type === "image/webp" ? "webp" : "jpg";
        return new File([blob], `payment.${ext}`, { type });
      }
    }
    return file; // couldn't encode, upload original
  } catch (err) {
    console.warn("compressImage failed, using original", err);
    return file;
  }
}