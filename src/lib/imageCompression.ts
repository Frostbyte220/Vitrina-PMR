/**
 * Утилита для клиентской валидации, оптимизации и сжатия изображений перед загрузкой в Cloudinary.
 * Позволяет сжимать "тяжелые" фото с современных смартфонов (15-20 МБ) до 150-400 КБ
 * без заметной потери визуального качества.
 */

export interface CompressionOptions {
  /** Максимальная ширина или высота в пикселях (по умолчанию 1600) */
  maxDimension?: number;
  /** Качество сжатия от 0.1 до 1.0 (по умолчанию 0.82) */
  quality?: number;
  /** Максимальный допустимый исходный размер файла в байтах (по умолчанию 30 МБ) */
  maxOriginalSizeBytes?: number;
  /** Предпочитаемый формат вывода: 'image/webp' или 'image/jpeg' */
  preferredFormat?: "image/webp" | "image/jpeg";
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  width: number;
  height: number;
}

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MAX_SIZE = 30 * 1024 * 1024; // 30 MB

/** Форматирует размер файла в удобочитаемый вид (например: "14.5 МБ" или "320 КБ") */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * Проверяет, является ли файл допустимым изображением и не превышает ли он лимит размера.
 */
export function validateImageFile(file: File, maxSizeBytes = DEFAULT_MAX_SIZE): void {
  if (!file) {
    throw new Error("Файл не выбран");
  }

  // Проверка типа
  const isImageMime = file.type.startsWith("image/");
  const hasImageExt = /\.(jpe?g|png|webp|heic|heif|gif|svg|avif)$/i.test(file.name);
  if (!isImageMime && !hasImageExt) {
    throw new Error(`Файл «${file.name}» не является поддерживаемым форматом изображения`);
  }

  // Проверка размера
  if (file.size > maxSizeBytes) {
    const limitFormatted = formatFileSize(maxSizeBytes);
    const actualFormatted = formatFileSize(file.size);
    throw new Error(
      `Файл «${file.name}» (${actualFormatted}) превышает допустимый размер ${limitFormatted}`
    );
  }
}

/**
 * Проверяет поддержку canvas.toBlob с заданным MIME-типом
 */
function supportsBlobType(canvas: HTMLCanvasElement, mimeType: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => {
        resolve(blob?.type === mimeType);
      }, mimeType, 0.5);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Сжимает и масштабирует изображение на стороне клиента через HTML5 Canvas.
 * - Уменьшает сверхвысокое разрешение современных камер (4000x3000 -> 1600x1200).
 * - Конвертирует в современный эффективный формат WebP (или JPEG с сохранением прозрачности при необходимости).
 * - Если файл уже оптимизирован и сжатие делает его больше — возвращает оригинал.
 * - Векторные SVG и анимированные GIF возвращаются без изменений во избежание потери анимации/вектора.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // На сервере ничего не сжимаем
  if (typeof window === "undefined") return file;

  const maxDimension = options.maxDimension || DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const maxOriginalSize = options.maxOriginalSizeBytes || DEFAULT_MAX_SIZE;

  // 1. Валидация файла
  validateImageFile(file, maxOriginalSize);

  // 2. Исключения: векторные SVG и анимированные GIF не сжимаем через Canvas
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // 3. Загружаем картинку в объект Image
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Не удалось декодировать изображение «${file.name}»`));
      img.src = objectUrl;
    });

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    // Если размеры некорректны
    if (!originalWidth || !originalHeight) {
      return file;
    }

    // 4. Вычисляем целевые пропорциональные размеры
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      if (originalWidth >= originalHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
      }
    }

    // Если фото уже небольшое по размеру и весит менее 200 КБ — нет смысла пережимать
    if (
      originalWidth <= maxDimension &&
      originalHeight <= maxDimension &&
      file.size < 200 * 1024
    ) {
      return file;
    }

    // 5. Отрисовываем на Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      // Если браузер не смог выделить контекст — отдаем оригинал
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 6. Выбираем целевой формат
    // WebP поддерживает и фотографии, и альфа-канал прозрачности
    const wantsWebp = options.preferredFormat !== "image/jpeg";
    const isWebpSupported = wantsWebp ? await supportsBlobType(canvas, "image/webp") : false;

    let targetMime = "image/jpeg";
    let targetExtension = ".jpg";

    if (isWebpSupported) {
      targetMime = "image/webp";
      targetExtension = ".webp";
    } else if (file.type === "image/png") {
      // Если WebP не поддерживается, а исходник был PNG — сохраняем PNG для прозрачности
      targetMime = "image/png";
      targetExtension = ".png";
    }

    // 7. Получаем Blob
    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        targetMime,
        targetMime === "image/png" ? undefined : quality
      );
    });

    if (!compressedBlob) {
      return file;
    }

    // 8. Если сжатый Blob больше оригинального файла — используем оригинал
    if (compressedBlob.size >= file.size && originalWidth <= maxDimension && originalHeight <= maxDimension) {
      return file;
    }

    // 9. Формируем новый File с правильным именем
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const newFileName = `${baseName}${targetExtension}`;

    const compressedFile = new File([compressedBlob], newFileName, {
      type: targetMime,
      lastModified: Date.now(),
    });

    // Статистика в консоль разработчика для прозрачности
    const savings = Math.max(0, file.size - compressedFile.size);
    const savingsPercent = Math.round((savings / file.size) * 100);
    console.log(
      `[ImageCompression] «${file.name}» (${originalWidth}x${originalHeight}): ` +
      `${formatFileSize(file.size)} ➔ ${formatFileSize(compressedFile.size)} ` +
      `(-${savingsPercent}%, ${targetWidth}x${targetHeight})`
    );

    return compressedFile;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
