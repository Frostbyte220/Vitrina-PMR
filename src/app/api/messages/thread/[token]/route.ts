import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Публичный эндпоинт — доступен без авторизации по токену треда
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const message = await prisma.message.findUnique({
    where: { threadToken: token },
    include: {
      replies: { orderBy: { createdAt: "asc" } },
      store: { select: { name: true, slug: true, avatarUrl: true } },
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Тред не найден" }, { status: 404 });
  }

  return NextResponse.json({ message });
}

// Покупатель отправляет дополнительное сообщение в тред
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const message = await prisma.message.findUnique({
    where: { threadToken: token },
    select: { id: true, senderName: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Тред не найден" }, { status: 404 });
  }

  const { body } = await req.json();
  if (!body || body.trim().length < 2) {
    return NextResponse.json({ error: "Сообщение слишком короткое" }, { status: 400 });
  }
  if (body.length > 1000) {
    return NextResponse.json({ error: "Сообщение слишком длинное" }, { status: 400 });
  }

  const reply = await prisma.messageReply.create({
    data: {
      messageId: message.id,
      senderType: "buyer",
      senderName: message.senderName,
      body: body.trim(),
    },
  });

  // Сбросить статус прочитано у продавца
  await prisma.message.update({
    where: { id: message.id },
    data: { isRead: false },
  });

  return NextResponse.json({ success: true, reply });
}
