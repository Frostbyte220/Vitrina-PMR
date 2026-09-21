import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { productSchema } from "@/lib/validations/product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Находим магазин текущего пользователя, чтобы привязать товар
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const newProduct = await prisma.product.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        price: validatedData.price,
        category: validatedData.category,
        subCategory: validatedData.subCategory || null,
        images: validatedData.images,
        userId: session.user.id,
        // Привязываем storeId, если магазин найден
        storeId: store ? store.id : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/shops");
    revalidatePath("/dashboard/products");

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Ошибка валидации", issues: error.issues },
        { status: 422 },
      );
    }
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}