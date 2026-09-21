"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
    return { success: true };
  } catch (error) {
    console.error("Ошибка при обновлении товара:", error);
    return { error: "Внутренняя ошибка сервера при обновлении" };
  }
}