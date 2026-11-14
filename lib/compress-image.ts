// lib/compress-image.ts
export async function compressImage(file: File, maxW = 1000, q = 0.7): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width);
  const c = document.createElement("canvas");
  c.width = bmp.width * scale;
  c.height = bmp.height * scale;
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", q));
  return blob ? new File([blob], "payment.webp", { type: "image/webp" }) : file;
}