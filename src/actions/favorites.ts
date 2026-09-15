"use server";

// Замени путь, если твой клиент Prisma лежит в другом месте (например, "@/lib/db")
import { prisma } from "@/lib/prisma"; 

export async function getFavoriteProducts(productIds: string[]) {
  if (!productIds || productIds.length === 0) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds, // Ищем все товары, чьи ID есть в нашем массиве
        },
      },
      include: {
        user: true, // Обязательно подтягиваем продавца, так как он нужен для ProductCard
      },
    });

    return products;
  } catch (error) {
    console.error("Ошибка при загрузке избранного:", error);
    return [];
  }
}