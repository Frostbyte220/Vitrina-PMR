import { NextResponse } from "next/server";
import { cleanupAllDeletedProductsImages } from "@/lib/cloudinaryServer";

/**
 * Очистка фотографий удаленных товаров из Cloudinary
 * Вызывается через Cron (Vercel Cron, Upstash) или вручную с токеном CRON_SECRET
 */
async function handleCleanup(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await cleanupAllDeletedProductsImages();

    console.log(
      `[Cleanup] Очищено товаров: ${stats.deletedProductsCount}, удалено фото: ${stats.deletedImagesCount}`
    );

    return NextResponse.json({
      success: true,
      message: `Очищено: ${stats.deletedProductsCount} товаров и ${stats.deletedImagesCount} изображений`,
      stats,
      errors: stats.errors.length > 0 ? stats.errors : undefined,
    });
  } catch (error: any) {
    console.error("Ошибка при выполнении cleanup:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleCleanup(req);
}

export async function GET(req: Request) {
  return handleCleanup(req);
}
