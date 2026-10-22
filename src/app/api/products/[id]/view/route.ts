import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const viewedCookie = cookieStore.get("pmr_viewed_ids")?.value || "";
    const viewedIds = viewedCookie ? viewedCookie.split(",") : [];

    // Защита от накрутки: если товар уже просматривался в текущей сессии браузера (24ч)
    if (viewedIds.includes(id)) {
      return NextResponse.json({ success: true, alreadyCounted: true });
    }

    // Инкрементируем просмотр товара в базе данных
    await prisma.product.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
      select: { id: true },
    });

    // Добавляем ID в куки (храним до 50 последних ID, чтобы не раздувать заголовок)
    const updatedIds = [...viewedIds, id].slice(-50);
    const response = NextResponse.json({ success: true, incremented: true });

    response.cookies.set("pmr_viewed_ids", updatedIds.join(","), {
      maxAge: 60 * 60 * 24, // 24 часа
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    // Если товар не найден (например удален во время просмотра) — тихо отвечаем успехом
    if (error?.code === "P2025") {
      return NextResponse.json({ success: false, notFound: true });
    }
    console.error("Error tracking product view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
