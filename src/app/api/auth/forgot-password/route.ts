import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { headers } from "next/headers";
import { forgotPasswordRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // 1. Защита от спама и исчерпания почтовых квот (Rate Limiting)
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    
    const isAllowed = await forgotPasswordRateLimiter.check(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Слишком много попыток сброса пароля. Пожалуйста, подождите 1 минуту." },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Используем 'any' для избежания ошибок типизации, если Prisma Client еще не сгенерировался до конца
    const user = await (prisma.user as any).findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      // Возвращаем успех даже если email не найден, чтобы не раскрывать базу (защита от перечисления)
      return NextResponse.json({ success: true });
    }

    // Удаляем старые токены пользователя
    await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Генерируем криптографически стойкий токен
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 час

    await (prisma as any).passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const safeBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const resetUrl = `${safeBaseUrl}/reset-password/${token}`;

    // В режиме разработки выводим ссылку в консоль
    if (process.env.NODE_ENV !== "production") {
      console.log("=====================================");
      console.log(`[СБРОС ПАРОЛЯ] Запрошено для: ${normalizedEmail}`);
      console.log(`[СБРОС ПАРОЛЯ] ССЫЛКА ДЛЯ ВОССТАНОВЛЕНИЯ: ${resetUrl}`);
      console.log("=====================================");
    }

    // Отправляем письмо, если SMTP настроен
    if (process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS)) {
      const emailResult = await sendPasswordResetEmail(normalizedEmail, resetUrl);
      if (!emailResult.success) {
        console.error("Не удалось отправить письмо:", emailResult.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
