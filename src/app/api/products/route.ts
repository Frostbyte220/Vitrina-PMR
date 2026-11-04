import { NextResponse } from "next/server";
import { getProducts } from "@/lib/cache";
import { getFuzzyProducts } from "@/lib/fuzzySearch";
import { CATEGORY_ALIASES } from "@/lib/constants/categories";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { productRateLimiter } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const ITEMS_PER_PAGE = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category     = searchParams.get("category") ?? undefined;
  const sub          = searchParams.get("sub") ?? undefined;
  const q            = searchParams.get("q") ?? undefined;
  const page         = Number(searchParams.get("page")) || 1;
  const sort         = searchParams.get("sort") ?? undefined;
  const minPrice     = searchParams.get("minPrice") ?? undefined;
  const maxPrice     = searchParams.get("maxPrice") ?? undefined;
  const cities       = searchParams.get("cities") ?? undefined;
  const sizes        = searchParams.get("sizes") ?? undefined;
  const discount     = searchParams.get("discount") ?? undefined;
  const availability = searchParams.get("availability") ?? undefined;

  const skip = (page - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest")                        orderBy = { createdAt: "asc" };
  if (sort === "price_asc")                     orderBy = { price: "asc" };
  if (sort === "price_desc")                    orderBy = { price: "desc" };
  if (sort === "title_asc" || sort === "title") orderBy = { title: "asc" };

  const selectedCities = cities ? cities.split(",").filter(Boolean) : [];
  const selectedSizes  = sizes  ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const conditions: any[] = [];

  if (discount === "true") {
    conditions.push({ oldPrice: { not: null, gt: 0 } });
  }
  if (availability) {
    conditions.push({ availability });
  }
  if (category && category !== "Все") {
    const aliases = CATEGORY_ALIASES[category];
    if (aliases && aliases.length > 0) {
      conditions.push({ category: { in: aliases } });
    } else {
      conditions.push({ category });
    }
  }
  if (sub) {
    conditions.push({
      OR: [
        { subCategory: sub },
        { subCategory: { contains: sub, mode: "insensitive" } },
        { title: { contains: sub, mode: "insensitive" } },
      ],
    });
  }
  if (selectedSizes.length > 0) {
    conditions.push({ sizes: { hasSome: selectedSizes } });
  }
  if (minPrice || maxPrice) {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const priceFilter: any = {};
    if (min !== null && !isNaN(min)) priceFilter.gte = min;
    if (max !== null && !isNaN(max)) priceFilter.lte = max;
    if (Object.keys(priceFilter).length > 0) {
      conditions.push({ price: priceFilter });
    }
  }
  if (selectedCities.length > 0) {
    conditions.push({
      OR: [
        { store: { cities: { hasSome: selectedCities } } },
        { user: { store: { cities: { hasSome: selectedCities } } } },
      ],
    });
  }

  const whereClause: any = { deletedAt: null, status: "Активен" };
  if (conditions.length > 0) {
    whereClause.AND = conditions;
  }

  const isCustomSort = Boolean(
    sort && ["oldest", "price_asc", "price_desc", "title_asc", "title"].includes(sort)
  );

  try {
    const [products, totalCount] = q?.trim()
      ? await getFuzzyProducts(q.trim(), whereClause, skip, ITEMS_PER_PAGE, orderBy, isCustomSort)
      : await getProducts(whereClause, skip, ITEMS_PER_PAGE, orderBy);

    return NextResponse.json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { products: [], totalCount: 0, totalPages: 0, currentPage: 1 },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const userId =
      session.user.id ||
      (
        await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true },
        })
      )?.id;

    if (!userId) {
      return NextResponse.json({ message: "Пользователь не найден" }, { status: 401 });
    }

    const isAllowed = await productRateLimiter.check(userId);
    if (!isAllowed) {
      return NextResponse.json(
        { message: "Слишком много запросов. Подождите минуту." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Находим магазин текущего пользователя, чтобы привязать товар
    const store = await prisma.store.findUnique({
      where: { userId },
      select: { id: true },
    });

    const newProduct = await prisma.product.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        price: validatedData.price,
        oldPrice: validatedData.oldPrice ?? null,
        category: validatedData.category,
        subCategory: validatedData.subCategory || null,
        sizes: validatedData.sizes || [],
        images: validatedData.images,
        availability: validatedData.availability || "В наличии",
        userId,
        // Привязываем storeId, если магазин найден
        storeId: store ? store.id : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/shops");
    revalidatePath("/dashboard/products");
    revalidateTag("products");

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError" || error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || "Ошибка валидации данных";
      return NextResponse.json(
        { message, issues: error.issues },
        { status: 422 }
      );
    }
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера при добавлении товара" },
      { status: 500 }
    );
  }
}

