import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email обязателен" }, { status: 400 });

    // Используем 'any' для избежания ошибок типизации, если Prisma Client еще не сгенерировался до конца
    const user = await (prisma.user as any).findUnique({ where: { email } });
    if (!user) {
      // Возвращаем успех даже если email не найден, чтобы не раскрывать базу
      return NextResponse.json({ success: true });
    }

    // Удаляем старые токены
    await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Генерируем токен
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 час

    await (prisma as any).passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // ДЛЯ РЕЖИМА РАЗРАБОТКИ: всегда выводим ссылку в консоль
    console.log("=====================================");
    console.log(`[СБРОС ПАРОЛЯ] Запрошено для: ${email}`);
    console.log(`[СБРОС ПАРОЛЯ] ССЫЛКА ДЛЯ ВОССТАНОВЛЕНИЯ: ${resetUrl}`);
    console.log("=====================================");

    // Пытаемся отправить реальное письмо, если SMTP настроен
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const emailResult = await sendPasswordResetEmail(email, resetUrl);
      if (!emailResult.success) {
        console.error("Не удалось отправить письмо:", emailResult.error);
        // Не блокируем пользователя в DEV-режиме, если письмо не ушло
      }
    } else {
      console.log("⚠️ SMTP не настроен. Письмо не отправлено. Используйте ссылку из консоли.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
