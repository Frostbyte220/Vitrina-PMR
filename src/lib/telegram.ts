/**
 * Утилиты для работы с Telegram Bot API
 * Бот: @evitrina_notify_bot
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface SendTelegramOptions {
  parseMode?: "HTML" | "Markdown";
  disableWebPagePreview?: boolean;
  replyMarkup?: any;
}

/**
 * Базовая отправка сообщения в Telegram чат
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: SendTelegramOptions = { parseMode: "HTML", disableWebPagePreview: true }
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN не задан в переменных окружения");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode || "HTML",
        disable_web_page_preview: options.disableWebPagePreview ?? true,
        reply_markup: options.replyMarkup,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Telegram] Ошибка отправки сообщения:", errData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram] Ошибка сетевого запроса:", error);
    return false;
  }
}

/**
 * Уведомление продавцу о новом прямом сообщении с сайта (через форму связи)
 */
export async function notifySellerNewMessage(params: {
  storeTelegramChatId: string;
  storeName?: string;
  productName: string;
  senderName: string;
  senderContact: string;
  body: string;
  threadToken?: string | null;
  baseUrl?: string;
}) {
  const base = params.baseUrl || process.env.NEXTAUTH_URL || "https://www.e-vitrina.com";
  const chatUrl = params.threadToken
    ? `${base}/chat/${params.threadToken}`
    : `${base}/dashboard/messages`;

  const text =
    `🔔 <b>Новый запрос по товару на E-Vitrina!</b>\n\n` +
    `📦 <b>Товар:</b> ${escapeHtml(params.productName)}\n` +
    `👤 <b>Покупатель:</b> ${escapeHtml(params.senderName)}\n` +
    `📞 <b>Связь:</b> <code>${escapeHtml(params.senderContact)}</code>\n\n` +
    `💬 <b>Вопрос покупателя:</b>\n<i>«${escapeHtml(params.body)}»</i>\n\n` +
    `👉 <a href="${chatUrl}"><b>Открыть диалог и ответить</b></a>`;

  return sendTelegramMessage(params.storeTelegramChatId, text, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "💬 Ответить покупателю", url: chatUrl }],
        [{ text: "🏪 Личный кабинет", url: `${base}/dashboard/messages` }],
      ],
    },
  });
}

/**
 * Уведомление продавцу, когда покупатель нажал кнопку связи (Instagram/Viber/Telegram/Тел)
 */
export async function notifySellerContactClick(params: {
  storeTelegramChatId: string;
  productTitle: string;
  channel: string;
  sellerName?: string;
  baseUrl?: string;
}) {
  const base = params.baseUrl || process.env.NEXTAUTH_URL || "https://www.e-vitrina.com";

  const channelEmoji: Record<string, string> = {
    Telegram: "✈️",
    Viber: "💜",
    Instagram: "📸",
    Телефон: "📞",
  };
  const emoji = channelEmoji[params.channel] || "💬";

  const text =
    `👀 <b>Интерес к вашему товару на E-Vitrina!</b>\n\n` +
    `📦 <b>Товар:</b> ${escapeHtml(params.productTitle)}\n` +
    `${emoji} <b>Канал:</b> Покупатель перешёл в <b>${escapeHtml(params.channel)}</b>\n\n` +
    `<i>Ожидайте входящее сообщение или звонок от клиента в ближайшее время!</i>`;

  return sendTelegramMessage(params.storeTelegramChatId, text, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "📊 Мои товары в кабинете", url: `${base}/dashboard/products` }],
      ],
    },
  });
}

/**
 * Тестовое приветственное сообщение при подключении
 */
export async function sendWelcomeNotification(chatId: string, storeName: string, baseUrl?: string) {
  const base = baseUrl || process.env.NEXTAUTH_URL || "https://www.e-vitrina.com";
  const text =
    `🎉 <b>Уведомления успешно подключены!</b>\n\n` +
    `Магазин: <b>${escapeHtml(storeName)}</b>\n\n` +
    `Теперь вы будете мгновенно получать сюда:\n` +
    `• Вопросы и заказы от покупателей с сайта\n` +
    `• Оповещения, когда клиенты открывают ваш Instagram, Viber или номер телефона\n\n` +
    `<i>Вам больше не нужно постоянно проверять почту — заявки придут прямо сюда!</i>`;

  return sendTelegramMessage(chatId, text, {
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🏪 Перейти на E-Vitrina", url: `${base}/dashboard` }],
      ],
    },
  });
}

/**
 * Безопасное экранирование спецсимволов HTML для Telegram
 */
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
