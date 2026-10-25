import nodemailer from "nodemailer";

// Создаем транспорт для отправки писем через SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // true для 465, false для других портов (например, 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

/**
 * Отправляет письмо для сброса пароля
 * @param to Email получателя
 * @param resetUrl Ссылка на страницу сброса с уникальным токеном
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  // Если используется Resend и домен не подтвержден, отправка разрешена ТОЛЬКО с onboarding@resend.dev
  const defaultFrom = process.env.SMTP_HOST?.includes('resend') 
    ? "E-Vitrina PMR <onboarding@resend.dev>" 
    : "E-Vitrina PMR <no-reply@vitrina-pmr.ru>";
  
  const from = process.env.EMAIL_FROM || defaultFrom;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #e11d48; text-align: center;">Восстановление пароля</h2>
      <p>Здравствуйте!</p>
      <p>Вы запросили сброс пароля для вашего аккаунта на платформе <strong>E-Vitrina PMR</strong>.</p>
      <p>Пожалуйста, нажмите на кнопку ниже, чтобы задать новый пароль. Ссылка действительна в течение 1 часа.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Сбросить пароль</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">Если кнопка не работает, скопируйте и вставьте эту ссылку в адресную строку вашего браузера:</p>
      <p style="color: #666; font-size: 14px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 20px;" />
      <p style="color: #999; font-size: 12px; text-align: center;">Если вы не запрашивали сброс пароля, просто проигнорируйте и удалите это письмо. Ваш аккаунт в безопасности.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "Сброс пароля | E-Vitrina PMR",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке email через SMTP:", error);
    return { success: false, error };
  }
}

/**
 * Отправляет продавцу email-уведомление о новом интересе покупателя
 * @param opts.to Email продавца
 * @param opts.sellerName Имя продавца
 * @param opts.productTitle Название товара
 * @param opts.productId ID товара
 * @param opts.channel Канал связи ("Telegram" | "Viber" | "Instagram" | "Телефон")
 * @param opts.baseUrl Базовый URL приложения
 */
export async function sendSellerNotification(opts: {
  to: string;
  sellerName: string;
  productTitle: string;
  productId: string;
  channel: string;
  baseUrl: string;
}): Promise<{ success: boolean; error?: unknown }> {
  const { to, sellerName, productTitle, productId, channel, baseUrl } = opts;

  const defaultFrom = process.env.SMTP_HOST?.includes("resend")
    ? "E-Vitrina PMR <onboarding@resend.dev>"
    : "E-Vitrina PMR <no-reply@vitrina-pmr.ru>";

  const from = process.env.EMAIL_FROM || defaultFrom;
  const productUrl = `${baseUrl}/product/${productId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
      <!-- Шапка -->
      <div style="background: #800020; padding: 28px 32px; text-align: center;">
        <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">💬 Новый интерес к товару</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">E-Vitrina PMR</p>
      </div>

      <!-- Тело -->
      <div style="padding: 28px 32px;">
        <p style="font-size: 16px; margin: 0 0 16px;">Здравствуйте, <strong>${sellerName}</strong>!</p>
        <p style="font-size: 15px; margin: 0 0 20px; line-height: 1.6; color: #444;">
          Покупатель написал вам через <strong style="color: #800020;">${channel}</strong> по товару
          <strong>«${productTitle}»</strong>.
        </p>

        <!-- Карточка товара -->
        <div style="background: #fdf2f5; border: 1px solid #f0d0d8; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #800020; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Товар</p>
          <p style="margin: 6px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${productTitle}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Канал: ${channel}</p>
        </div>

        <!-- Кнопка -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${productUrl}" style="background-color: #800020; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
            Посмотреть товар →
          </a>
        </div>

        <p style="font-size: 13px; color: #999; margin: 16px 0 0;">
          Если кнопка не работает, скопируйте ссылку:<br />
          <a href="${productUrl}" style="color: #800020; word-break: break-all;">${productUrl}</a>
        </p>
      </div>

      <!-- Подвал -->
      <div style="background: #f9f9f9; border-top: 1px solid #eee; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #aaa;">
          E-Vitrina PMR — Локальные магазины Приднестровья
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `💬 Новый интерес к товару «${productTitle}» | E-Vitrina PMR`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке уведомления продавцу:", error);
    return { success: false };
  }
}

/**
 * Отправляет продавцу ежедневную сводку интереса к товарам
 * @param opts.to Email продавца
 * @param opts.sellerName Имя продавца / название магазина
 * @param opts.totalClicks Общее число переходов за сутки
 * @param opts.products Список товаров с переходами
 * @param opts.baseUrl Базовый URL приложения
 */
export async function sendSellerDailyDigestEmail(opts: {
  to: string;
  sellerName: string;
  totalClicks: number;
  products: { id: string; title: string; clicks: number }[];
  baseUrl: string;
}): Promise<{ success: boolean; error?: unknown }> {
  const { to, sellerName, totalClicks, products, baseUrl } = opts;

  const defaultFrom = process.env.SMTP_HOST?.includes("resend")
    ? "E-Vitrina PMR <onboarding@resend.dev>"
    : "E-Vitrina PMR <no-reply@vitrina-pmr.ru>";

  const from = process.env.EMAIL_FROM || defaultFrom;
  const dashboardUrl = `${baseUrl}/dashboard/products`;

  const productsListHtml = products
    .map(
      (p) => `
        <div style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <a href="${baseUrl}/product/${p.id}" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 14px;">
                  ${p.title}
                </a>
              </td>
              <td style="text-align: right; vertical-align: middle; width: 110px;">
                <span style="background: #fdf2f5; color: #800020; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 12px; display: inline-block;">
                  ${p.clicks} ${p.clicks === 1 ? "клик" : p.clicks < 5 ? "клика" : "кликов"}
                </span>
              </td>
            </tr>
          </table>
        </div>
      `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
      <!-- Шапка -->
      <div style="background: #800020; padding: 28px 32px; text-align: center;">
        <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">📊 Сводка интереса к товарам</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">E-Vitrina PMR</p>
      </div>

      <!-- Тело -->
      <div style="padding: 28px 32px;">
        <p style="font-size: 16px; margin: 0 0 16px;">Здравствуйте, <strong>${sellerName}</strong>!</p>
        <p style="font-size: 15px; margin: 0 0 20px; line-height: 1.6; color: #444;">
          Сегодня покупатели <strong>${totalClicks}</strong> ${totalClicks === 1 ? "раз открывали" : "раза открывали"} ваши контакты для связи по следующим товарам:
        </p>

        <!-- Список товаров -->
        <div style="background: #fafafa; border: 1px solid #eee; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          ${productsListHtml}
        </div>

        <!-- Кнопка -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${dashboardUrl}" style="background-color: #800020; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
            Перейти в мои товары →
          </a>
        </div>
      </div>

      <!-- Подвал -->
      <div style="background: #f9f9f9; border-top: 1px solid #eee; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #aaa;">
          E-Vitrina PMR — Локальные магазины Приднестровья
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `📊 Сводка за день: ${totalClicks} ${totalClicks === 1 ? "человек интересовался вашими товарами" : "человек интересовались вашими товарами"} | E-Vitrina PMR`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке сводки продавцу:", error);
    return { success: false, error };
  }
}
