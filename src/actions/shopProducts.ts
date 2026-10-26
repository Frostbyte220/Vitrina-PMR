"use server";

import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";

export interface FetchShopProductsParams {
  storeUserId: string;
  storeName: string;
  storeSlug?: string | null;
  storeInstagram?: string | null;
  storeAvatarUrl?: string | null;
  storeCities?: string[];
  storeTelegram?: string | null;
  storeViber?: string | null;
  storePhone?: string | null;
  storeIsVerified?: boolean;
  category?: string;
  subCategory?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "title_asc";
  searchQuery?: string;
  skip?: number;
  take?: number;
}

export async function fetchShopProducts(params: FetchShopProductsParams) {
  const {
    storeUserId,
    storeName,
    storeSlug,
    storeInstagram,
    storeAvatarUrl,
    storeCities = [],
    storeTelegram,
    storeViber,
    storePhone,
    storeIsVerified = false,
    category,
    subCategory,
    sort = "newest",
    searchQuery,
    skip = 0,
    take = 12,
  } = params;

  if (!storeUserId) {
    return { products: [], totalCount: 0, hasMore: false };
  }

  const conditions: any[] = [
    { deletedAt: null },
    { userId: storeUserId },
    { status: "Активен" },
  ];

  if (category && category !== "all" && category !== "Все товары") {
    conditions.push({ category });
  }

  if (subCategory && subCategory !== "all") {
    conditions.push({ subCategory });
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    conditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const where = { AND: conditions };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "title_asc") orderBy = { title: "asc" };

  try {
    const [rawProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          price: true,
          oldPrice: true,
          category: true,
          subCategory: true,
          sizes: true,
          availability: true,
          images: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const cleanInstagram = storeInstagram ? storeInstagram.replace(/^@/, "") : "";

    const products: Product[] = rawProducts.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      oldPrice: item.oldPrice,
      category: item.category,
      subCategory: item.subCategory,
      sizes: item.sizes || [],
      images:
        item.images && item.images.length > 0
          ? item.images
          : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"],
      shopName: storeName,
      shopUsername: cleanInstagram || storeSlug || "",
      description: item.description,
      status: item.status || "Активен",
      availability: item.availability || "В наличии",
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      store: {
        name: storeName,
        slug: storeSlug,
        instagram: storeInstagram,
        avatarUrl: storeAvatarUrl,
        cities: storeCities,
        telegram: storeTelegram,
        viber: storeViber,
        phone: storePhone,
        isVerified: storeIsVerified,
      },
    }));

    const hasMore = skip + products.length < totalCount;

    return {
      products,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching shop products:", error);
    return { products: [], totalCount: 0, hasMore: false };
  }
}
