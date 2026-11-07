import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "evitrina_notify_bot";

/**
 * GET /api/telegram
 * Возвращает статус подключения Telegram для текущего магазина
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true, slug: true, telegramChatId: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Магазин не найден" }, { status: 404 });
    }

    const isConnected = Boolean(store.telegramChatId);
    const connectUrl = `https://t.me/${BOT_NAME}?start=${store.id}`;

    return NextResponse.json({
      isConnected,
      botUsername: BOT_NAME,
      connectUrl,
    });
  } catch (error) {
    console.error("[Telegram API GET]", error);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}

/**
 * POST /api/telegram
 * Действия: "test" (проверка) или "disconnect" (отключение)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true, telegramChatId: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Магазин не найден" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // 1. Тестовое уведомление
    if (action === "test") {
      if (!store.telegramChatId) {
        return NextResponse.json(
          { error: "Сначала подключите Telegram к магазину" },
          { status: 400 }
        );
      }

      const result = await sendTelegramMessage(
        store.telegramChatId,
        `🔔 <b>Тестовое уведомление от E-Vitrina!</b>\n\n` +
        `Магазин: <b>${store.name}</b>\n\n` +
        `✅ Всё настроено и работает отлично. Сюда будут поступать реальные заказы и вопросы от покупателей!`
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Не удалось отправить сообщение" },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, message: "Тестовое сообщение отправлено!" });
    }

    // 2. Отключение Telegram
    if (action === "disconnect") {
      await prisma.store.update({
        where: { id: store.id },
        data: { telegramChatId: null },
      });

      return NextResponse.json({ success: true, message: "Telegram отключён" });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (error) {
    console.error("[Telegram API POST]", error);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
