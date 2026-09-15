import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Обновление товара (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В новых версиях Next.js params нужно распаковывать через await
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Обновляем товар, только если он принадлежит текущему пользователю
    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
        userId: session.user.id, // Защита от редактирования чужих товаров
      },
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        price: validatedData.price,
        category: validatedData.category,
        subCategory: validatedData.subCategory || null,
        images: validatedData.images,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Ошибка валидации", issues: error.issues },
        { status: 422 }
      );
    }
    
    // Ошибка P2025 означает, что запись не найдена (или чужая)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Товар не найден или у вас нет прав на его редактирование" },
        { status: 404 }
      );
    }

    console.error("[PRODUCT_PATCH]", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Удаление товара (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В новых версиях Next.js params нужно распаковывать через await
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    // Мягкое удаление: вместо .delete() используем .update()
    const deletedProduct = await prisma.product.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Товар успешно удален", product: deletedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Товар не найден или у вас нет прав на его удаление" },
        { status: 404 }
      );
    }

    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}