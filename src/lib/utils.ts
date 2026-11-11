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
 * Формирует мгновенную прямую ссылку на Instagram (Android Intent / iOS App Scheme / Web)
 * без медленных промежуточных веб-редиректов ig.me, вызывающих долгую задержку и белый экран.
 */
export function getInstagramDeepLink(rawUsername: string): { url: string; target: string } {
  const username = (rawUsername || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .split(/[/?#]/)[0]
    .trim();

  if (!username) {
    return { url: "https://www.instagram.com/", target: "_blank" };
  }

  if (typeof navigator === "undefined") {
    return { url: `https://www.instagram.com/${username}/`, target: "_blank" };
  }

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    // На Android: системный Intent моментально запускает приложение Instagram (0 секунд ожидания)
    return {
      url: `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end`,
      target: "_self",
    };
  }

  if (isIOS) {
    // На iOS: схема instagram:// открывает приложение моментально
    return {
      url: `instagram://user?username=${username}`,
      target: "_self",
    };
  }

  // На десктопе: открываем профиль/диалог в веб-версии в новой вкладке
  return {
    url: `https://www.instagram.com/${username}/`,
    target: "_blank",
  };
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
