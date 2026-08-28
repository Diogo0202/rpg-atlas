export type PortraitCropSettings = {
  zoom: number;
  focusX: number;
  focusY: number;
  outputSize: number;
};

export const portraitSizes = [256, 512, 768] as const;

export const defaultPortraitCrop: PortraitCropSettings = {
  zoom: 1,
  focusX: 50,
  focusY: 50,
  outputSize: 512,
};

export function normalizePortraitCrop(settings: Partial<PortraitCropSettings>): PortraitCropSettings {
  const outputSize = portraitSizes.includes(settings.outputSize as typeof portraitSizes[number]) ? Number(settings.outputSize) : defaultPortraitCrop.outputSize;
  const boundedNumber = (value: unknown, minimum: number, maximum: number, fallback: number) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.min(maximum, Math.max(minimum, numeric)) : fallback;
  };
  return {
    zoom: boundedNumber(settings.zoom, 1, 2.5, defaultPortraitCrop.zoom),
    focusX: boundedNumber(settings.focusX, 0, 100, defaultPortraitCrop.focusX),
    focusY: boundedNumber(settings.focusY, 0, 100, defaultPortraitCrop.focusY),
    outputSize,
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    image.src = source;
  });
}

export async function cropPortraitToDataUrl(source: string, settings: Partial<PortraitCropSettings> = {}): Promise<string> {
  const crop = normalizePortraitCrop(settings);
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = crop.outputSize;
  canvas.height = crop.outputSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não disponibilizou o editor de imagem.");
  const scale = Math.max(crop.outputSize / image.naturalWidth, crop.outputSize / image.naturalHeight) * crop.zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (crop.outputSize - width) * (crop.focusX / 100);
  const y = (crop.outputSize - height) * (crop.focusY / 100);
  context.fillStyle = "#101211";
  context.fillRect(0, 0, crop.outputSize, crop.outputSize);
  context.drawImage(image, x, y, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}
