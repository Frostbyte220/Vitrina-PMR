import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { storeId, productId, productName, senderName, senderContact, body } = await req.json();

    if (!storeId || !productName || !senderName || !senderContact || !body) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (body.length > 1000) {
      return NextResponse.json({ error: "Сообщение слишком длинное" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        storeId,
        productId: productId || null,
        productName,
        senderName: senderName.trim(),
        senderContact: senderContact.trim(),
        body: body.trim(),
      },
    });

    return NextResponse.json({ success: true, id: message.id, threadToken: message.threadToken });
  } catch (e) {
    console.error("POST /api/messages error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find store belonging to this user
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!store) {
    return NextResponse.json({ messages: [] });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "1";

  const messages = await prisma.message.findMany({
    where: { storeId: store.id, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ messages });
}
