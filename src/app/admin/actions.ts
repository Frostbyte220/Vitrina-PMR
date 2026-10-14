"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAIL || session.user.email !== ADMIN_EMAIL) {
    throw new Error("Доступ запрещен");
  }
}

export async function deleteProductAdmin(productId: string) {
  await checkAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { 
      deletedAt: new Date(),
      status: "Скрыт модератором"
    }
  });
  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function restoreProductAdmin(productId: string) {
  await checkAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { 
      deletedAt: null,
      status: "Активен"
    }
  });
  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function migrateProductsAction(): Promise<{ storeId: number; subCategory: number; total: number }> {
  await checkAdmin();

  // Получаем все магазины для маппинга userId -> storeId
  const stores = await prisma.store.findMany({ select: { id: true, userId: true } });
  const storeByUserId = new Map(stores.map((s) => [s.userId, s.id]));

  // Получаем все активные товары
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, category: true, subCategory: true, storeId: true, userId: true },
  });

  const subCatCategories = ["Одежда", "Обувь", "Спорт и отдых", "Косметика", "Парфюмерия"];
  let updatedStoreId = 0;
  let updatedSubCategory = 0;

  for (const product of products) {
    const updates: Record<string, string> = {};

    // 1. Привязать к storeId
    if (!product.storeId && product.userId) {
      const storeId = storeByUserId.get(product.userId);
      if (storeId) {
        updates.storeId = storeId;
        updatedStoreId++;
      }
    }

    // 2. Установить subCategory если пустая
    if (
      subCatCategories.includes(product.category) &&
      (!product.subCategory || product.subCategory === "")
    ) {
      updates.subCategory = "Для женщин";
      updatedSubCategory++;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: product.id }, data: updates });
    }
  }

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/admin");

  return { storeId: updatedStoreId, subCategory: updatedSubCategory, total: products.length };
}

export async function deleteStoreAdmin(storeId: string) {
  await checkAdmin();
  // Жесткое удаление магазина
  await prisma.store.delete({
    where: { id: storeId }
  });
  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/shops");
}
