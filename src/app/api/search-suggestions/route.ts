import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "Активен",
        deletedAt: null,
        title: {
          contains: q.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        category: true,
      },
      take: 5,
    });

    return NextResponse.json({ suggestions: products });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
