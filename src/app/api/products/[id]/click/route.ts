import { NextResponse } from "next/server";
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

    // Инкрементируем счетчик переходов в контакты (Telegram/Viber/Instagram/Телефон)
    await prisma.product.update({
      where: { id },
      data: {
        contactClicksCount: { increment: 1 },
      },
      select: { id: true },
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
