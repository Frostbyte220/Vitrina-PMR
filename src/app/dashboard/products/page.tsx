import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";
import { Pagination } from "@/components/Pagination";
import { ProductsTableClient } from "./ProductsTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Мои товары | Vitrina PMR",
};

const ITEMS_PER_PAGE = 20;

export default async function DashboardProductsPage({
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
    deletedAt: null,
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
      images: p.images,
      shopName: p.user?.name || "Магазин",
      shopUsername: p.user?.instagram || "",
      description: p.description,
      status: p.status || "Активен",
      userId: p.userId,
    } as Product;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 md:px-8 md:pb-8 flex-1">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          Управление товарами
        </h1>
        <p className="text-sm text-text-muted">
          Здесь вы можете редактировать, скрывать или удалять ваши товары.
        </p>
      </div>

      <ProductsTableClient items={products} searchQuery={q} />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </main>
  );
}
