import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Извлекает public_id из URL Cloudinary
 * Например: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/my-image.jpg
 * -> "folder/my-image"
 */
function extractPublicId(url: string): string | null {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Защита эндпоинта секретным ключом через заголовок Authorization
 * Вызывается из cron-job (например, vercel.json cron или Upstash)
 */
export async function POST(req: Request) {
  // Проверяем секретный ключ для защиты эндпоинта от посторонних
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Находим все "мягко удаленные" товары старше 30 дней
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deletedProducts = await (prisma.product as any).findMany({
      where: {
        deletedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        images: true,
      },
    });

    if (deletedProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Нет товаров для очистки",
        deleted: 0,
      });
    }

    let deletedImages = 0;
    let deletedProducts_count = 0;
    const errors: string[] = [];

    for (const product of deletedProducts) {
      // Удаляем каждую картинку из Cloudinary
      for (const imageUrl of product.images as string[]) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            deletedImages++;
          } catch (e) {
            const msg = `Ошибка при удалении изображения ${publicId}: ${e}`;
            console.error(msg);
            errors.push(msg);
          }
        }
      }

      // Физически удаляем запись из базы данных
      try {
        await (prisma.product as any).delete({ where: { id: product.id } });
        deletedProducts_count++;
      } catch (e) {
        console.error(`Ошибка при удалении товара ${product.id}:`, e);
      }
    }

    console.log(`[GC] Очищено: ${deletedProducts_count} товаров, ${deletedImages} изображений.`);

    return NextResponse.json({
      success: true,
      message: `Очищено: ${deletedProducts_count} товаров и ${deletedImages} изображений`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Ошибка Garbage Collector:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
