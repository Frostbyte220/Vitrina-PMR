import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, sendWelcomeNotification } from "@/lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * GET /api/telegram/webhook
 * Вспомогательный эндпоинт для проверки статуса вебхука или его регистрации
 */
export async function GET(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // Запрос инфо о вебхуке из Telegram
  if (action === "info") {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  // Регистрация вебхука (action=set&url=https://...)
  if (action === "set") {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const defaultUrl = `${proto}://${host}/api/telegram/webhook`;
    const targetUrl = searchParams.get("url") || defaultUrl;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ["message"],
      }),
    });
    const data = await res.json();
    return NextResponse.json({ registeredUrl: targetUrl, telegramResponse: data });
  }

  return NextResponse.json({
    status: "ok",
    bot: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "evitrina_notify_bot",
    usage: {
      info: "/api/telegram/webhook?action=info",
      set: "/api/telegram/webhook?action=set",
    },
  });
}

/**
 * POST /api/telegram/webhook
 * Обработчик входящих событий от Telegram Bot API
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    const message = update?.message;
    if (!message || !message.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = (message.text || "").trim();

    // 1. Команда /start с параметром (диплинк: /start <storeId>)
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const param = parts[1]?.trim();

      if (param) {
        // Ищем магазин по id, slug или instagram
        const store = await prisma.store.findFirst({
          where: {
            OR: [
              { id: param },
              { slug: param.toLowerCase() },
              { instagram: param.replace(/^@/, "").toLowerCase() },
            ],
          },
          select: { id: true, name: true, slug: true },
        });

        if (store) {
          await prisma.store.update({
            where: { id: store.id },
            data: { telegramChatId: chatId },
          });

          await sendWelcomeNotification(chatId, store.name);
          return NextResponse.json({ ok: true });
        }
      }

      // Если параметр отсутствует или магазин не найден
      const baseUrl = process.env.NEXTAUTH_URL || "https://www.e-vitrina.com";
      await sendTelegramMessage(
        chatId,
        `👋 <b>Здравствуйте!</b>\n\n` +
        `Это официальный бот уведомлений маркетплейса <b>E-Vitrina PMR</b>.\n\n` +
        `Чтобы подключить уведомления о заказах и вопросах для вашего магазина:\n` +
        `1. Войдите в личный кабинет на <a href="${baseUrl}/dashboard">e-vitrina.com</a>\n` +
        `2. Перейдите в раздел <b>Настройки магазина</b>\n` +
        `3. Нажмите кнопку <b>«Подключить Telegram»</b>.\n\n` +
        `После этого заявки от покупателей будут приходить прямо сюда!`
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Команда /stop или /disconnect (отключение уведомлений)
    if (text === "/stop" || text === "/disconnect") {
      const updated = await prisma.store.updateMany({
        where: { telegramChatId: chatId },
        data: { telegramChatId: null },
      });

      if (updated.count > 0) {
        await sendTelegramMessage(
          chatId,
          `🔕 <b>Уведомления отключены.</b>\n\nВы больше не будете получать сообщения о заказах в этот чат. Вы всегда можете подключить их снова в настройках магазина.`
        );
      } else {
        await sendTelegramMessage(chatId, `У вас нет активных подключений к магазинам.`);
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Любое другое сообщение — подсказка
    await sendTelegramMessage(
      chatId,
      `ℹ️ Этот бот используется для отправки уведомлений о заказах и запросах с сайта <a href="https://www.e-vitrina.com">E-Vitrina PMR</a>.\n\n` +
      `Команды:\n` +
      `/start — информация о подключении\n` +
      `/stop — отключить уведомления`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook Error]", error);
    // Возвращаем 200, чтобы Telegram не повторял ошибочный запрос бесконечно
    return NextResponse.json({ ok: true });
  }
}
