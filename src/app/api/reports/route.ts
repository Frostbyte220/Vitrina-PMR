import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportRateLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting по IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    
    const isAllowed = await reportRateLimiter.check(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Слишком много запросов. Пожалуйста, подождите минуту перед следующей отправкой." },
        { status: 429 }
      );
    }

    // 2. Парсинг и валидация тела запроса
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const { productId, reason, details } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Идентификатор товара обязателен" }, { status: 400 });
    }

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ error: "Пожалуйста, выберите причину жалобы" }, { status: 400 });
    }

    // Проверяем, существует ли такой товар
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, deletedAt: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const trimmedDetails = details && typeof details === "string" 
      ? details.trim().substring(0, 500) 
      : null;

    // 3. Создаем запись о жалобе в БД
    const report = await prisma.productReport.create({
      data: {
        productId,
        reason: reason.trim(),
        details: trimmedDetails,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Жалоба отправлена модераторам. Спасибо за помощь в поддержке порядка на платформе!",
      reportId: report.id,
    });
  } catch (error: any) {
    console.error("Ошибка при сохранении жалобы:", error);
    return NextResponse.json(
      { error: "Не удалось отправить жалобу. Попробуйте позже." },
      { status: 500 }
    );
  }
}
