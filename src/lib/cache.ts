import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getProducts = unstable_cache(
  async (whereClause: any, skip: number, take: number, orderBy: any = { createdAt: "desc" }) => {
    return prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          category: true,
          subCategory: true,
          user: {
            select: {
              name: true,
              instagram: true,
              avatar: true,
              store: {
                select: {
                  name: true,
                  slug: true,
                  instagram: true,
                  avatarUrl: true,
                  cities: true,
                },
              },
            },
          },
          store: {
            select: {
              name: true,
              slug: true,
              instagram: true,
              avatarUrl: true,
              cities: true,
            },
          },
        },
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);
  },
  ["products-catalog"],
  { revalidate: 60, tags: ["products"] }
);
