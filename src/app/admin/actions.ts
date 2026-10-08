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
