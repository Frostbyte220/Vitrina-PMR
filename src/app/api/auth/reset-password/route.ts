import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Токен и пароль обязательны" }, { status: 400 });
    }

    const resetToken = await (prisma as any).passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Неверный или несуществующий токен" }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Срок действия токена истек" }, { status: 400 });
    }

    // Хэшируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Обновляем пароль пользователя
    await (prisma.user as any).update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Удаляем использованный токен
    await (prisma as any).passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при сохранении нового пароля:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
