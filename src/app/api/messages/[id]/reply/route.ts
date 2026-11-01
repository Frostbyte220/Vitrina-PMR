import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Продавец отвечает на сообщение из своего дашборда
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Проверяем что это сообщение принадлежит магазину этого продавца
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!store) return NextResponse.json({ error: "Магазин не найден" }, { status: 404 });

  const message = await prisma.message.findFirst({
    where: { id, storeId: store.id },
    select: { id: true, isRead: true },
  });
  if (!message) return NextResponse.json({ error: "Сообщение не найдено" }, { status: 404 });

  const { body } = await req.json();
  if (!body || body.trim().length < 2) {
    return NextResponse.json({ error: "Ответ слишком короткий" }, { status: 400 });
  }

  const reply = await prisma.messageReply.create({
    data: {
      messageId: id,
      senderType: "seller",
      senderName: store.name,
      body: body.trim(),
    },
  });

  // Помечаем как прочитанное
  await prisma.message.update({ where: { id }, data: { isRead: true } });

  return NextResponse.json({ success: true, reply });
}
