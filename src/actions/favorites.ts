"use server";

// Замени путь, если твой клиент Prisma лежит в другом месте (например, "@/lib/db")
import { prisma } from "@/lib/prisma"; 

export async function getFavoriteProducts(productIds: string[]) {
  if (!productIds || productIds.length === 0) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        // Не показываем удалённые и скрытые товары в избранном
        deletedAt: null,
        status: "Активен",
      },
      include: {
        user: {
          include: { store: true },
        },
      },
    });

    return products;
  } catch (error) {
    console.error("Ошибка при загрузке избранного:", error);
    return [];
  }
}