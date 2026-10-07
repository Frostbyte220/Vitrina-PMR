import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to");

    if (!to) {
      return NextResponse.json({ error: "Укажите параметр ?to=ваш@email.com в URL" }, { status: 400 });
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

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Тестовое письмо от E-Vitrina PMR",
      html: "<p>Если вы это читаете, SMTP работает отлично!</p>",
    });

    return NextResponse.json({
      success: true,
      message: "Письмо успешно отправлено!",
      info,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from,
        passLength: (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)?.length || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error.toString(),
      details: error
    }, { status: 500 });
  }
}
