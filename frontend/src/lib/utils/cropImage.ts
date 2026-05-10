/**
 * Crop image dari sumber URL (kompatibel dengan File via URL.createObjectURL)
 * sesuai area piksel yang diberikan oleh react-easy-crop, lalu resize ke target
 * persegi (default 800x800) — sesuai resolusi foto profil di MinIO.
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  outputSize = 800,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.9
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Background putih untuk JPEG (avoid black bila transparan)
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas toBlob returned null"));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}
