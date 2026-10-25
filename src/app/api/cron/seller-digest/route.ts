import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSellerDailyDigestEmail } from "@/lib/mail";

export async function GET(req: Request) {
  return handleDigest(req);
}

export async function POST(req: Request) {
  return handleDigest(req);
}

async function handleDigest(req: Request) {
  // Проверяем секретный ключ для защиты эндпоинта от несанкционированного доступа
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://vitrina-pmr.vercel.app";

    // Находим продавцов, у товаров которых зафиксированы переходы в контакты
    const sellersWithClicks = await prisma.user.findMany({
      where: {
        products: {
          some: {
            contactClicksCount: { gt: 0 },
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        store: { select: { name: true } },
        products: {
          where: {
            contactClicksCount: { gt: 0 },
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            contactClicksCount: true,
          },
          orderBy: { contactClicksCount: "desc" },
        },
      },
    });

    if (sellersWithClicks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Нет активностей по товарам для отправки сводки",
        sent: 0,
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const seller of sellersWithClicks) {
      if (!seller.email) continue;

      const totalClicks = seller.products.reduce((acc, p) => acc + p.contactClicksCount, 0);
      if (totalClicks === 0) continue;

      const topProducts = seller.products.slice(0, 10).map((p) => ({
        id: p.id,
        title: p.title,
        clicks: p.contactClicksCount,
      }));

      try {
        const result = await sendSellerDailyDigestEmail({
          to: seller.email,
          sellerName: seller.name || seller.store?.name || "Продавец",
          totalClicks,
          products: topProducts,
          baseUrl,
        });

        if (result.success) {
          sentCount++;
        }
      } catch (err) {
        errors.push(`Ошибка отправки продавцу ${seller.email}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      totalSellers: sellersWithClicks.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Ошибка при генерации ежедневной сводки продавцам:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
