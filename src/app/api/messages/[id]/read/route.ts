import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const { id } = await params;

  const msg = await prisma.message.findFirst({
    where: { id, storeId: store.id },
  });
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.message.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}
