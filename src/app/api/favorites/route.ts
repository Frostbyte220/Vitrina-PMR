import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/favorites
 * Возвращает массив productId из избранного авторизованного пользователя.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favorites: true },
  });

  return NextResponse.json({ favorites: user?.favorites ?? [] });
}

/**
 * PUT /api/favorites
 * Полностью заменяет список избранного пользователя переданным массивом.
 * Body: { favorites: string[] }
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { favorites?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const favorites = body.favorites;
  if (!Array.isArray(favorites) || favorites.some((f) => typeof f !== "string")) {
    return NextResponse.json({ error: "favorites must be string[]" }, { status: 400 });
  }

  // Ограничиваем размер (не более 500 товаров в избранном)
  const capped = (favorites as string[]).slice(0, 500);

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { favorites: capped },
    select: { favorites: true },
  });

  return NextResponse.json({ favorites: updated.favorites });
}

/**
 * PATCH /api/favorites
 * Переключает один товар в избранном (добавляет если нет, удаляет если есть).
 * Body: { productId: string }
 * Возвращает: { favorites: string[], added: boolean }
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { productId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId } = body;
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favorites: true },
  });

  const current = user?.favorites ?? [];
  const isAlreadyFav = current.includes(productId);

  const newFavorites = isAlreadyFav
    ? current.filter((id) => id !== productId)
    : [...current, productId].slice(0, 500);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { favorites: newFavorites },
  });

  return NextResponse.json({ favorites: newFavorites, added: !isAlreadyFav });
}
