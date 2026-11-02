// ─────────────────────────────────────────────────────────────
// 📊 Единый модуль аналитики (Яндекс Метрика & цели конверсий)
// ─────────────────────────────────────────────────────────────

/**
 * Стандартные идентификаторы целей для Яндекс Метрики:
 * 1. contact_seller       — нажатие на любой контакт продавца (мессенджер, телефон, чат)
 * 2. lead_viber           — клик по Viber
 * 3. lead_telegram        — клик по Telegram
 * 4. lead_instagram       — клик по Instagram Direct
 * 5. lead_phone           — клик по номеру телефона (IDC)
 * 6. cart_checkout_click  — нажатие кнопки «Оформить заказ» в корзине
 * 7. cart_order_send      — отправка заказа из корзины в мессенджер продавцу
 * 8. onsite_message_sent  — успешная отправка сообщения продавцу через внутренний чат
 * 9. search               — поисковый запрос в каталоге
 */
export const METRIKA_GOALS = {
  CONTACT_SELLER: "contact_seller",
  LEAD_VIBER: "lead_viber",
  LEAD_TELEGRAM: "lead_telegram",
  LEAD_INSTAGRAM: "lead_instagram",
  LEAD_PHONE: "lead_phone",
  CART_CHECKOUT_CLICK: "cart_checkout_click",
  CART_ORDER_SEND: "cart_order_send",
  ONSITE_MESSAGE_SENT: "onsite_message_sent",
  SEARCH: "search",
} as const;

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window === "undefined") return;

  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[YM Analytics] reachGoal: "${eventName}"`, eventParams || {});
  }

  // 1. Отправка цели в Яндекс Метрику
  if (window.ym && ymId) {
    try {
      const parsedId = parseInt(ymId, 10);
      if (!isNaN(parsedId)) {
        window.ym(parsedId, "reachGoal", eventName, eventParams);
      }
    } catch (err) {
      console.warn("[YM Analytics] Ошибка вызова reachGoal:", err);
    }
  }

  // 2. Отправка в dataLayer (для возможной связки с Google Tag / GA4)
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
};

