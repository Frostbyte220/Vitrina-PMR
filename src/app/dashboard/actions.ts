"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";

// Делаем аргументы гибкими: принимаем любые варианты передачи данных от формы
export async function createProduct(arg1: any, arg2?: any) {
  try {
    // 🔥 УМНЫЙ ПОИСК FORMDATA 🔥
    const formData = (arg2 instanceof FormData) ? arg2 : arg1;

    // Защита от дурака: если formData всё равно не найдена
    if (!formData || typeof formData.get !== 'function') {
      console.error("❌ ОШИБКА: FormData не получена сервером");
      return { error: "Не удалось получить данные формы" };
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { error: "Не авторизован" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return { error: "Магазин (пользователь) не найден в базе данных" };
    }

    const rawData = {
      title: formData.get("title"),
      price: formData.get("price"),
      description: formData.get("description") || "",
      category: formData.get("category") || "Обувь",
      images: formData.getAll("images").filter(Boolean),
    };

    const imageStr = formData.get("image");
    if (imageStr && typeof imageStr === "string" && rawData.images.length === 0) {
      rawData.images = [imageStr];
    } else if (rawData.images.length === 0) {
      rawData.images = ["https://via.placeholder.com/400?text=Нет+фото"];
    }

    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("❌ ОШИБКА ВАЛИДАЦИИ ФОРМЫ:", validatedFields.error.flatten().fieldErrors);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Заполните форму корректно",
      };
    }

    const { title, price, description, category, images } = validatedFields.data;

    // 👇 ДОБАВЛЕНО: Достаем subCategory из формы
    const subCategoryStr = formData.get("subCategory");
    const subCategory = typeof subCategoryStr === "string" && subCategoryStr.trim() !== "" 
      ? subCategoryStr 
      : null;

    await prisma.product.create({
      data: {
        title,
        price,
        images,
        description: description || null,
        category,
        subCategory, // <-- Передаем в БД
        status: "Активен",
        userId: user.id, 
      },
    });

    console.log("✅ ТОВАР УСПЕШНО СОЗДАН В БАЗЕ!");
    revalidateTag("products");

    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Ошибка при создании товара:", error);
    return { error: "Внутренняя ошибка сервера при создании товара" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { success: false, error: "Не авторизован" };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!product) {
      return { success: false, error: "Товар не найден" };
    }

    if (product.user?.email !== session.user?.email) {
      return { success: false, error: "У вас нет прав на удаление этого товара" };
    }

    // 🔥 МЯГКОЕ УДАЛЕНИЕ (Soft Delete)
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "Удален",
      },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout");
    revalidateTag("products");
    
    return { success: true };
  } catch (error) {
    console.error("Ошибка при удалении товара:", error);
    return { success: false, error: "Внутренняя ошибка сервера при удалении товара" };
  }
}

export async function toggleProductStatus(id: string, currentStatus: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!product || product.user?.id !== session.user.id) {
      return { success: false, error: "Товар не найден или у вас нет прав" };
    }

    const newStatus = currentStatus === "Активен" ? "Скрыт" : "Активен";

    await prisma.product.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/products", "layout");
    revalidateTag("products");
    revalidatePath("/", "layout");

    return { success: true, newStatus };
  } catch (error) {
    console.error("Ошибка при обновлении статуса:", error);
    return { success: false, error: "Не удалось обновить статус" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { error: "Не авторизован" };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!product || product.user?.email !== session.user?.email) {
      return { error: "У вас нет прав на редактирование этого товара" };
    }

    const rawData = {
      title: formData.get("title"),
      price: formData.get("price"),
      description: formData.get("description") || "",
      category: formData.get("category") || product.category,
      images: formData.getAll("images").filter(Boolean),
    };

    if (rawData.images.length === 0) {
      rawData.images = product.images.length > 0 
        ? product.images 
        : ["https://via.placeholder.com/400?text=Нет+фото"];
    }

    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("❌ ОШИБКА ВАЛИДАЦИИ ПРИ ОБНОВЛЕНИИ:", validatedFields.error.flatten().fieldErrors);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Заполните форму корректно",
      };
    }

    const { title, price, description, category, images } = validatedFields.data;

    // 👇 ДОБАВЛЕНО: Обновление subCategory
    const subCategoryStr = formData.get("subCategory");
    const subCategory = typeof subCategoryStr === "string" && subCategoryStr.trim() !== "" 
      ? subCategoryStr 
      : null;

    await prisma.product.update({
      where: { id },
      data: {
        title,
        price,
        images,
        description: description || null,
        category,
        subCategory, // <-- Обновляем в БД
      },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout");
    revalidateTag("products");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении товара:", error);
    return { error: "Внутренняя ошибка сервера при обновлении" };
  }
}

export async function bulkUpdateProductsStatus(ids: string[], status: "Активен" | "Скрыт") {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: "Товары не выбраны" };
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
        deletedAt: null,
      },
      data: { status },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/products", "layout");
    revalidatePath("/", "layout");
    revalidateTag("products");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Ошибка при массовом обновлении статуса:", error);
    return { success: false, error: "Не удалось обновить выбранные товары" };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: "Товары не выбраны" };
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        status: "Удален",
      },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/products", "layout");
    revalidatePath("/", "layout");
    revalidateTag("products");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Ошибка при массовом удалении товаров:", error);
    return { success: false, error: "Не удалось удалить выбранные товары" };
  }
}

export async function duplicateProduct(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const original = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        oldPrice: true,
        category: true,
        subCategory: true,
        sizes: true,
        images: true,
        userId: true,
        storeId: true,
      },
    });

    if (!original || original.userId !== session.user.id) {
      return { success: false, error: "Товар не найден или у вас нет прав на его копирование" };
    }

    const newProduct = await prisma.product.create({
      data: {
        title: `${original.title} (копия)`,
        description: original.description,
        price: original.price,
        oldPrice: original.oldPrice,
        category: original.category,
        subCategory: original.subCategory,
        sizes: original.sizes,
        images: original.images,
        status: "Скрыт",
        userId: session.user.id,
        storeId: original.storeId,
      },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/products", "layout");
    revalidatePath("/", "layout");
    revalidateTag("products");

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Ошибка при дублировании товара:", error);
    return { success: false, error: "Не удалось создать копию товара" };
  }
}
