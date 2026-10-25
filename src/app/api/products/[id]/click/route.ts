import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSellerNotification } from "@/lib/mail";
import { sellerNotificationRateLimiter } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Читаем канал из тела запроса (необязательно)
    let channel = "мессенджере";
    try {
      const body = await req.json();
      if (body?.channel && typeof body.channel === "string") {
        // Приводим id канала к читаемому названию
        const channelMap: Record<string, string> = {
          telegram: "Telegram",
          viber: "Viber",
          instagram: "Instagram",
          phone: "Телефон",
        };
        channel = channelMap[body.channel.toLowerCase()] ?? body.channel;
      }
    } catch {
      // Тело может быть пустым — игнорируем
    }

    // Инкрементируем счетчик переходов в контакты (Telegram/Viber/Instagram/Телефон)
    await prisma.product.update({
      where: { id },
      data: {
        contactClicksCount: { increment: 1 },
      },
      select: { id: true },
    });

    // Надежная фоновая отправка уведомления продавцу через Next.js 15 after()
    // Гарантирует завершение отправки на Vercel serverless без блокировки ответа клиенту
    after(async () => {
      try {
        // Защита от спама: не более 1 email по товару в течение 10 минут
        const canSend = await sellerNotificationRateLimiter.check(id);
        if (!canSend) {
          return;
        }

        const product = await prisma.product.findUnique({
          where: { id },
          select: {
            title: true,
            userId: true,
            store: { select: { name: true } },
            user: { select: { email: true, name: true } },
          },
        });

        if (product?.user?.email) {
          const baseUrl =
            process.env.NEXTAUTH_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://vitrina-pmr.vercel.app";

          await sendSellerNotification({
            to: product.user.email,
            sellerName: product.user.name || product.store?.name || "Продавец",
            productTitle: product.title,
            productId: id,
            channel,
            baseUrl,
          });
        }
      } catch (notifyErr) {
        console.error("Ошибка при отправке уведомления продавцу:", notifyErr);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ success: false, notFound: true });
    }
    console.error("Error tracking contact click:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
