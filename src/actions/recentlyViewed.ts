"use server";

import { prisma } from "@/lib/prisma";

export async function getRecentlyViewedProducts(
  productIds: string[],
  currentProductId?: string
) {
  if (!productIds || productIds.length === 0) return [];

  // Исключаем текущий открытый товар (если передан)
  const filteredIds = currentProductId
    ? productIds.filter((id) => id !== currentProductId)
    : productIds;

  if (filteredIds.length === 0) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { in: filteredIds },
        deletedAt: null,
        status: "Активен",
      },
      select: {
        id: true,
        title: true,
        price: true,
        oldPrice: true,
        images: true,
        category: true,
        subCategory: true,
        sizes: true,
        user: {
          select: {
            name: true,
            instagram: true,
            avatar: true,
            store: {
              select: {
                name: true,
                slug: true,
                instagram: true,
                avatarUrl: true,
                cities: true,
                phone: true,
                telegram: true,
                viber: true,
              },
            },
          },
        },
        store: {
          select: {
            name: true,
            slug: true,
            instagram: true,
            avatarUrl: true,
            cities: true,
            phone: true,
            telegram: true,
            viber: true,
          },
        },
      },
    });

    // Сохраняем исходный порядок просмотров (самые свежие первыми)
    const productMap = new Map(products.map((p) => [p.id, p]));
    return filteredIds
      .map((id) => productMap.get(id))
      .filter((p): p is (typeof products)[0] => Boolean(p));
  } catch (error) {
    console.error("Ошибка при получении недавно просмотренных товаров:", error);
    return [];
  }
}
