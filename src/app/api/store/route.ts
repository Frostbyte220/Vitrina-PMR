import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(store || null, { status: 200 });
  } catch (error) {
    console.error("[STORE_GET]", error);
    return NextResponse.json({ message: "Внутренняя ошибка" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    
    // Базовая валидация (в идеале добавить Zod, как в товарах)
    if (!body.name || !body.slug) {
      return NextResponse.json({ message: "Название и ссылка обязательны" }, { status: 400 });
    }

    // Upsert: Создает, если нет, или обновляет, если есть
    const store = await prisma.store.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        name: body.name,
        slug: body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'), // Очистка slug'а
        description: body.description,
        instagram: body.instagram,
        phone: body.phone,
        cities: body.cities,
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
      },
      create: {
        userId: session.user.id,
        name: body.name,
        slug: body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: body.description,
        instagram: body.instagram,
        phone: body.phone,
        cities: body.cities,
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
      },
    });

    return NextResponse.json(store, { status: 200 });
  } catch (error: any) {
    // Обработка ошибки, если slug уже занят другим магазином
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Эта ссылка (slug) уже занята другим магазином" }, { status: 409 });
    }
    
    console.error("[STORE_POST]", error);
    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}