import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddProductButton from "@/components/AddProductButton";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";
import { Pagination } from "@/components/Pagination";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { ProductGridClient } from "./ProductGridClient";

const ITEMS_PER_PAGE = 12;

function getPlural(number: number, one: string, two: string, five: string) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const params = await searchParams;
  const q = params.q || "";
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereClause = {
    deletedAt: null, // <-- ДОБАВЛЕНО: Исключаем мягко удаленные товары
    user: {
      email: session.user.email,
    },
    OR: q
      ? [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [dbProducts, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip: skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const products: Product[] = dbProducts.map((p) => {
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      subCategory: p.subCategory, 
      images: p.images, // Просто передаем массив напрямую
      shopName: p.user?.name || "Магазин",
      shopUsername: p.user?.instagram || "",
      description: p.description,
      status: p.status || "Активен",
      userId: p.userId,
      user: p.user
        ? {
            id: p.user.id,
            name: p.user.name,
            instagram: p.user.instagram,
          }
        : null,
    } as Product;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 md:px-8 md:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">
            Мои товары
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {totalCount > 0
              ? `Опубликовано: ${totalCount} ${getPlural(totalCount, "товар", "товара", "товаров")}`
              : "Управление вашим ассортиментом"}
          </p>
        </div>

        <div className="shrink-0">
          <AddProductButton />
        </div>
      </div>

      <div className="mb-6">
        <DashboardSearch initialQuery={q} />
      </div>

      <ProductGridClient items={products} searchQuery={q} />

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </main>
  );
}