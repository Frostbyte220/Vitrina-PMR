import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  // Защита: эндпоинт доступен только в режиме разработки (development)
  // либо авторизованному супер-администратору в продакшене.
  const isDev = process.env.NODE_ENV !== "production";
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = Boolean(
    session?.user?.email &&
    adminEmail &&
    session.user.email.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!isDev && !isAdmin) {
    return NextResponse.json(
      { error: "Доступ запрещен. Эндпоинт доступен только администратору." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to");

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Укажите корректный параметр ?to=ваш@email.com в URL" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
      },
    });

    const from = process.env.EMAIL_FROM || "E-Vitrina PMR <onboarding@resend.dev>";

    await transporter.sendMail({
      from,
      to,
      subject: "Тестовое письмо от E-Vitrina PMR",
      html: "<p>Если вы это читаете, SMTP работает отлично!</p>",
    });

    return NextResponse.json({
      success: true,
      message: "Письмо успешно отправлено!",
      to,
    });
  } catch (error: any) {
    console.error("[TEST_EMAIL_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: isDev ? error.message || error.toString() : "Ошибка при отправке письма",
      },
      { status: 500 }
    );
  }
}
