import nodemailer from "nodemailer";

// Создаем транспорт для отправки писем через SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // true для 465, false для других портов (например, 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Отправляет письмо для сброса пароля
 * @param to Email получателя
 * @param resetUrl Ссылка на страницу сброса с уникальным токеном
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM || "Vitrina PMR <no-reply@vitrina-pmr.ru>";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #e11d48; text-align: center;">Восстановление пароля</h2>
      <p>Здравствуйте!</p>
      <p>Вы запросили сброс пароля для вашего аккаунта на платформе <strong>Vitrina PMR</strong>.</p>
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
      subject: "Сброс пароля | Vitrina PMR",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке email через SMTP:", error);
    return { success: false, error };
  }
}
