export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} Руб`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Cloudinary-loader для Next.js Image.
 * Добавляет f_auto,q_auto,w_{width} прямо в URL — CDN отдаёт
 * уже готовую картинку нужного размера вместо оригинала.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src || !src.includes("res.cloudinary.com")) return src;

  // Если URL уже содержит трансформации, обновляем ширину
  if (/\/upload\/[^/]*f_auto/.test(src)) {
    return src.replace(/w_\d+/, `w_${width}`);
  }

  const q = quality ? `q_${quality}` : "q_auto";
  return src.replace(/\/upload\//, `/upload/f_auto,${q},w_${width},c_limit/`);
}

/** Крошечный серый blur-placeholder (10×10) для плавного появления фото */
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAFUlEQVR4nGNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==";
