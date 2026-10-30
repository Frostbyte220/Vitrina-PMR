"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import bcrypt from "bcryptjs";

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

const CLOTHING_SIZES_ALL = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const SHOE_SIZES_ALL = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

function pickRandomSizes(pool: string[]): string[] {
  // Берём 2–5 случайных размеров из пула (смежных, как в реальном магазине)
  const count = 2 + Math.floor(Math.random() * 4); // 2-5
  const start = Math.floor(Math.random() * Math.max(1, pool.length - count));
  return pool.slice(start, start + count);
}

export async function fillRandomSizesAction(): Promise<{ updated: number; total: number }> {
  await checkAdmin();

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      category: { in: ["Одежда", "Обувь", "Спорт и отдых"] },
    },
    select: { id: true, category: true, sizes: true },
  });

  let updated = 0;

  for (const product of products) {
    // Обновляем только те, у которых sizes пустой
    if (product.sizes && product.sizes.length > 0) continue;

    const pool = product.category === "Обувь" ? SHOE_SIZES_ALL : CLOTHING_SIZES_ALL;
    const sizes = pickRandomSizes(pool);

    await prisma.product.update({
      where: { id: product.id },
      data: { sizes },
    });
    updated++;
  }

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/admin");

  return { updated, total: products.length };
}

export async function deleteStoreAdmin(storeId: string) {
  await checkAdmin();
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (store?.userId) {
    try {
      await prisma.user.delete({ where: { id: store.userId } });
    } catch {
      await prisma.store.delete({ where: { id: storeId } });
    }
  } else {
    await prisma.store.delete({ where: { id: storeId } });
  }

  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/shops");
  revalidatePath("/");
}

export async function resolveReportAdmin(reportId: string, hideProduct = true) {
  await checkAdmin();
  
  const report = await prisma.productReport.findUnique({
    where: { id: reportId },
    select: { id: true, productId: true },
  });

  if (!report) throw new Error("Жалоба не найдена");

  if (hideProduct) {
    await prisma.product.update({
      where: { id: report.productId },
      data: {
        deletedAt: new Date(),
        status: "Скрыт модератором",
      },
    });
  }

  await prisma.productReport.update({
    where: { id: reportId },
    data: { status: "RESOLVED" },
  });

  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/product/${report.productId}`);
}

export async function dismissReportAdmin(reportId: string) {
  await checkAdmin();
  await prisma.productReport.update({
    where: { id: reportId },
    data: { status: "DISMISSED" },
  });
  revalidatePath("/admin");
}

export async function deleteReportAdmin(reportId: string) {
  await checkAdmin();
  await prisma.productReport.delete({
    where: { id: reportId },
  });
  revalidatePath("/admin");
}

export async function touchAndRevalidateAllProductsAction(): Promise<{ count: number }> {
  await checkAdmin();
  // 1. Обновляем метку времени всех активных товаров в БД
  const result = await prisma.product.updateMany({
    where: { deletedAt: null },
    data: { updatedAt: new Date() },
  });

  // 2. Сбрасываем кэш Next.js App Router для всех страниц
  revalidateTag("products");
  revalidatePath("/", "layout");

  return { count: result.count };
}

export type BannerInput = {
  title: string;
  sub?: string;
  label?: string;
  cta?: string;
  href?: string;
  bg?: string;
  emoji?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
};

export async function createBannerAdmin(data: BannerInput) {
  await checkAdmin();
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({
    data: {
      title: data.title.trim(),
      sub: data.sub?.trim() || null,
      label: data.label?.trim() || null,
      cta: data.cta?.trim() || "Подробнее",
      href: data.href?.trim() || "/",
      bg: data.bg?.trim() || "from-rose-600 to-rose-800",
      emoji: data.emoji?.trim() || "✨",
      imageUrl: data.imageUrl?.trim() || null,
      isActive: data.isActive ?? true,
      order: data.order ?? count,
    },
  });

  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin");
  return banner;
}

export async function updateBannerAdmin(id: string, data: BannerInput) {
  await checkAdmin();
  const banner = await prisma.banner.update({
    where: { id },
    data: {
      title: data.title.trim(),
      sub: data.sub?.trim() || null,
      label: data.label?.trim() || null,
      cta: data.cta?.trim() || "Подробнее",
      href: data.href?.trim() || "/",
      bg: data.bg?.trim() || "from-rose-600 to-rose-800",
      emoji: data.emoji?.trim() || "✨",
      imageUrl: data.imageUrl?.trim() || null,
      isActive: data.isActive,
      order: data.order,
    },
  });

  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin");
  return banner;
}

export async function toggleBannerActiveAdmin(id: string, isActive: boolean) {
  await checkAdmin();
  await prisma.banner.update({
    where: { id },
    data: { isActive },
  });

  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteBannerAdmin(id: string) {
  await checkAdmin();
  await prisma.banner.delete({
    where: { id },
  });

  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleStoreVerifiedAdmin(storeId: string, isVerified: boolean) {
  await checkAdmin();
  await prisma.store.update({
    where: { id: storeId },
    data: { isVerified },
  });

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/shops");
}

export type QuickCreateStoreInput = {
  instagram: string;
  name?: string;
  cities?: string[];
  phone?: string;
  telegram?: string;
  viber?: string;
  description?: string;
};

export type QuickCreateStoreResult = {
  success: boolean;
  store: {
    id: string;
    name: string;
    slug: string;
    instagram: string | null;
    isVerified: boolean;
    createdAt: Date;
    _count: { products: number };
    user?: { email: string } | null;
  };
  credentials: {
    email: string;
    password: string;
  };
  url: string;
  directMessageTemplate: string;
};

export async function createStoreByInstagramAdmin(
  input: QuickCreateStoreInput
): Promise<QuickCreateStoreResult> {
  await checkAdmin();

  const rawInsta = input.instagram || "";
  const cleanInsta = rawInsta
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .trim()
    .toLowerCase();

  if (!cleanInsta || cleanInsta.length < 2) {
    throw new Error("Укажите корректный ник в Instagram (минимум 2 символа)");
  }

  // Проверка уникальности слага магазина
  const existingStore = await prisma.store.findFirst({
    where: {
      OR: [
        { slug: cleanInsta },
        { instagram: { equals: cleanInsta, mode: "insensitive" } },
      ],
    },
  });

  if (existingStore) {
    throw new Error(`Магазин со слагом или Instagram «${cleanInsta}» уже существует!`);
  }

  // Название витрины
  const storeName = input.name?.trim() || cleanInsta;

  // Формируем технический dummy email
  let dummyEmail = `${cleanInsta}@unclaimed.e-vitrina.com`;
  const existingUser = await prisma.user.findUnique({
    where: { email: dummyEmail },
  });
  if (existingUser) {
    dummyEmail = `${cleanInsta}_${Math.floor(1000 + Math.random() * 9000)}@unclaimed.e-vitrina.com`;
  }

  // Генерируем временный пароль для легкой передачи доступа
  const plainPassword = `pmr_${cleanInsta}2026`;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const selectedCities =
    input.cities && input.cities.length > 0
      ? input.cities
      : ["Тирасполь", "Бендеры"];

  const user = await prisma.user.create({
    data: {
      name: storeName,
      email: dummyEmail,
      password: hashedPassword,
      instagram: cleanInsta,
      instagramUrl: `https://instagram.com/${cleanInsta}`,
      store: {
        create: {
          name: storeName,
          slug: cleanInsta,
          instagram: cleanInsta,
          description: input.description?.trim() || null,
          phone: input.phone?.trim() || null,
          telegram: input.telegram?.replace(/^@+/, "").replace(/https?:\/\/t\.me\//i, "").trim() || null,
          viber: input.viber?.trim() || null,
          cities: selectedCities,
          isVerified: false,
        },
      },
    },
    include: {
      store: {
        include: {
          _count: { select: { products: true } },
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!user.store) {
    throw new Error("Не удалось создать витрину магазина");
  }

  revalidateTag("products");
  revalidatePath("/admin");
  revalidatePath("/shops");
  revalidatePath("/");

  const showcaseUrl = `https://e-vitrina.com/shop/${cleanInsta}`;
  const directMessageTemplate = `Здравствуйте! 👋\nОчень понравился ваш ассортимент и подача профиля.\n\nМы запустили локальную платформу E-Vitrina PMR, чтобы местным брендам было проще продавать, а покупателям — находить товары по городам Приднестровья.\n\nСобрали для вас аккуратную онлайн-витрину с каталогом и фильтрами по наличию:\n👉 ${showcaseUrl}\n\nЭто полностью бесплатно. Покупателям удобно листать каталог как в полноценном интернет-магазине, а заказывать они переходят прямо к вам в Direct/Telegram.\n\nВзгляните, как вам такой формат? Будем рады, если витрина сэкономит вам время на однотипных вопросах в переписке 😊`;

  return {
    success: true,
    store: {
      id: user.store.id,
      name: user.store.name,
      slug: user.store.slug,
      instagram: user.store.instagram,
      isVerified: user.store.isVerified,
      createdAt: user.store.createdAt,
      _count: user.store._count,
      user: user.store.user,
    },
    credentials: {
      email: dummyEmail,
      password: plainPassword,
    },
    url: showcaseUrl,
    directMessageTemplate,
  };
}
