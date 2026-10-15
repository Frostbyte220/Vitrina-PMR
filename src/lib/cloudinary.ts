import { compressImage, CompressionOptions } from "./imageCompression";

export interface UploadOptions extends CompressionOptions {
  /** Пропустить сжатие, если требуется загрузить исходник */
  skipCompression?: boolean;
  /** Коллбэк для уведомления о текущем статусе (например: "Сжатие...", "Загрузка в облако...") */
  onStatusChange?: (status: string) => void;
}

/**
 * Загружает изображение в Cloudinary с предварительным клиентским сжатием и безопасной подписью.
 *
 * 1. Проверяет файл на валидность и максимальный размер.
 * 2. Оптимизирует и сжимает фото на клиенте (через HTML5 Canvas), уменьшая 15-20 МБ до ~200-300 КБ.
 * 3. Запрашивает серверную подпись из /api/cloudinary/sign.
 * 4. Загружает оптимизированный файл в Cloudinary и возвращает secure_url.
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const { skipCompression = false, onStatusChange, ...compressionOptions } = options;

  let fileToUpload = file;

  // 1. Клиентское сжатие и уменьшение разрешения
  if (!skipCompression) {
    onStatusChange?.("Оптимизация и сжатие...");
    fileToUpload = await compressImage(file, compressionOptions);
  }

  // 2. Получение защищенной подписи для загрузки
  onStatusChange?.("Подготовка к загрузке...");
  const signRes = await fetch("/api/cloudinary/sign");
  if (!signRes.ok) {
    throw new Error("Не удалось получить подпись для безопасной загрузки изображения");
  }

  const { signature, timestamp, apiKey, uploadPreset } = await signRes.json();

  // 3. Формирование FormData
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("upload_preset", uploadPreset);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Не настроено имя облака Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)");
  }

  // 4. Отправка в Cloudinary API
  onStatusChange?.("Загрузка в облако...");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Ошибка Cloudinary: ${errorData?.error?.message || response.statusText || "Не удалось загрузить файл"}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}