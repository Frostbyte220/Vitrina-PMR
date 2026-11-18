import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

// Инициализация серверного клиента Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Надежно извлекает public_id из URL Cloudinary любого формата:
 * - С версией (/v1234567890/...)
 * - Без версии
 * - С трансформациями (/c_fill,w_800/...)
 * - Во вложенных папках (/folder/subfolder/image.webp)
 * Возвращает null для сторонних ссылок (placeholder, unsplash и т.д.)
 */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let path = url.slice(uploadIndex + "/upload/".length);
    // Удаляем query-параметры и хэш
    path = path.split("?")[0].split("#")[0];

    const parts = path.split("/").filter(Boolean);
    const cleanParts: string[] = [];
    let passedPrefix = false;

    for (const part of parts) {
      if (!passedPrefix) {
        // Пропускаем сегмент версии (v1234567890)
        if (/^v\d+$/.test(part)) {
          passedPrefix = true;
          continue;
        }
        // Пропускаем трансформации (c_fill, w_500, f_auto, q_auto и т.д.)
        if (
          /^[a-z]_[a-z0-9_,-]+$/i.test(part) ||
          /^(w_|h_|c_|q_|f_|b_|e_|l_|o_|r_|u_|x_|y_|z_)/i.test(part)
        ) {
          continue;
        }
        passedPrefix = true;
      }
      cleanParts.push(part);
    }

    if (cleanParts.length === 0) return null;

    const fullPath = cleanParts.join("/");
    // Удаляем расширение файла (.jpg, .png, .webp и т.д.)
    return fullPath.replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return null;
  }
}

/**
 * Удаляет массив изображений из Cloudinary по их URL.
 * Использует пакетное удаление (batch) через Admin API для максимальной скорости.
 */
export async function deleteCloudinaryImages(
  urls: (string | null | undefined)[]
): Promise<{ deleted: number; errors: string[] }> {
  if (!urls || urls.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const publicIds = Array.from(
    new Set(
      urls
        .map(extractCloudinaryPublicId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );

  if (publicIds.length === 0) {
    return { deleted: 0, errors: [] };
  }

  let deleted = 0;
  const errors: string[] = [];

  // Разбиваем на батчи по 100 штук (лимит Cloudinary delete_resources)
  const BATCH_SIZE = 100;
  for (let i = 0; i < publicIds.length; i += BATCH_SIZE) {
    const batch = publicIds.slice(i, i + BATCH_SIZE);

    try {
      const result = await cloudinary.api.delete_resources(batch);
      if (result?.deleted) {
        for (const [id, status] of Object.entries(result.deleted)) {
          if (status === "deleted") {
            deleted++;
          } else if (status === "not_found") {
            // Файл уже был удален ранее — считаем успехом
            deleted++;
          }
        }
      }
    } catch (batchErr: any) {
      console.warn(
        `[Cloudinary] Batch delete failed, falling back to uploader.destroy:`,
        batchErr?.message || batchErr
      );

      // Фоллбек: поштучное удаление через uploader.destroy
      await Promise.allSettled(
        batch.map(async (publicId) => {
          try {
            await cloudinary.uploader.destroy(publicId);
            deleted++;
          } catch (err: any) {
            const msg = `Ошибка удаления ${publicId}: ${err?.message || err}`;
            console.error(msg);
            errors.push(msg);
          }
        })
      );
    }
  }

  console.log(`[Cloudinary] Удалено изображений: ${deleted} из ${publicIds.length}`);
  return { deleted, errors };
}

/**
 * Удобная обертка для удаления фотографий конкретного товара
 */
export async function deleteProductImagesFromCloudinary(images: string[]): Promise<number> {
  if (!images || images.length === 0) return 0;
  const { deleted } = await deleteCloudinaryImages(images);
  return deleted;
}

/**
 * Полная очистка всех фотографий удаленных товаров из базы данных и Cloudinary.
 * Находит все товары со статусом "deletedAt !== null" и удаляет их фото из облака.
 */
export async function cleanupAllDeletedProductsImages(): Promise<{
  deletedProductsCount: number;
  deletedImagesCount: number;
  errors: string[];
}> {
  try {
    // 1. Находим все удаленные товары с фотографиями
    const deletedProducts = await prisma.product.findMany({
      where: {
        deletedAt: { not: null },
      },
      select: {
        id: true,
        images: true,
      },
    });

    const productsWithImages = deletedProducts.filter(
      (p) => Array.isArray(p.images) && p.images.length > 0
    );

    if (productsWithImages.length === 0) {
      return {
        deletedProductsCount: 0,
        deletedImagesCount: 0,
        errors: [],
      };
    }

    // 2. Собираем все URL фотографий
    const allImages = productsWithImages.flatMap((p) => p.images as string[]);

    // 3. Удаляем их из Cloudinary
    const { deleted, errors } = await deleteCloudinaryImages(allImages);

    // 4. Очищаем массив images в базе, чтобы освободить место и избежать повторного удаления
    await prisma.product.updateMany({
      where: {
        id: { in: productsWithImages.map((p) => p.id) },
      },
      data: {
        images: [],
      },
    });

    return {
      deletedProductsCount: productsWithImages.length,
      deletedImagesCount: deleted,
      errors,
    };
  } catch (error: any) {
    console.error("Ошибка при очистке фото удаленных товаров:", error);
    throw error;
  }
}
