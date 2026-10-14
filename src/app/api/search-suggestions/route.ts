import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/validations/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], stores: [], categories: [], suggestions: [] });
  }

  try {
    const [products, stores] = await Promise.all([
      // 1. Поиск товаров по названию или категории
      prisma.product.findMany({
        where: {
          status: "Активен",
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { subCategory: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          category: true,
          sizes: true,
          store: {
            select: {
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
          user: {
            select: {
              name: true,
              instagram: true,
              avatar: true,
              store: {
                select: {
                  name: true,
                  slug: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),

      // 2. Поиск магазинов по названию или instagram
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
          _count: {
            select: { products: { where: { status: "Активен", deletedAt: null } } },
          },
        },
        take: 3,
      }),
    ]);

    // 3. Подбор подходящих категорий
    const matchingCategories = CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);

    return NextResponse.json({
      products,
      stores,
      categories: matchingCategories,
      suggestions: products, // обратная совместимость
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ products: [], stores: [], categories: [], suggestions: [] }, { status: 500 });
  }
}
