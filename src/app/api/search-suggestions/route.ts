import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/validations/product";
import { isHiddenStore } from "@/lib/storeFilter";
import { getFuzzySuggestions, getFuzzyStores, getRussianStem } from "@/lib/fuzzySearch";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], stores: [], categories: [], suggestions: [] });
  }

  // Подбор категорий (всегда работает, без БД)
  const stem = getRussianStem(q.toLowerCase());
  const matchingCategories = CATEGORIES.filter((cat) => {
    const lowerCat = cat.toLowerCase();
    const lowerQ = q.toLowerCase();
    return (
      lowerCat.includes(lowerQ) ||
      (stem.length >= 3 && lowerCat.includes(stem))
    );
  }).slice(0, 3);

  // Пробуем нечёткий поиск (pg_trgm), при ошибке — fallback на ILIKE
  let products: any[] = [];
  let stores: any[] = [];

  try {
    [products, stores] = await Promise.all([
      getFuzzySuggestions(q, 6),
      getFuzzyStores(q, 3),
    ]);
  } catch (fuzzyError) {
    console.warn("pg_trgm недоступен, переключаемся на ILIKE fallback:", fuzzyError);
    // Fallback: простой ILIKE поиск без pg_trgm
    try {
      const pattern = `%${q}%`;
      [products, stores] = await Promise.all([
        prisma.product.findMany({
          where: {
            status: "Активен",
            deletedAt: null,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            category: true,
            sizes: true,
            store: { select: { name: true, slug: true, avatarUrl: true, isVerified: true } },
            user: {
              select: {
                name: true,
                instagram: true,
                avatar: true,
                store: { select: { name: true, slug: true, avatarUrl: true, isVerified: true } },
              },
            },
          },
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.store.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { instagram: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            instagram: true,
            avatarUrl: true,
            cities: true,
            isVerified: true,
            _count: {
              select: { products: { where: { status: "Активен", deletedAt: null } } },
            },
          },
          take: 3,
        }),
      ]);
    } catch (fallbackError) {
      console.error("Search fallback error:", fallbackError);
    }
  }

  return NextResponse.json({
    products,
    stores: stores.filter((s: any) => !isHiddenStore(s)),
    categories: matchingCategories,
    suggestions: products,
  });
}
