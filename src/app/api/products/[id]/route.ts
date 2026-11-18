import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { productRateLimiter } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteProductImagesFromCloudinary } from "@/lib/cloudinaryServer";

// РћР±РЅРѕРІР»РµРЅРёРµ С‚РѕРІР°СЂР° (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Р’ РЅРѕРІС‹С… РІРµСЂСЃРёСЏС… Next.js params РЅСѓР¶РЅРѕ СЂР°СЃРїР°РєРѕРІС‹РІР°С‚СЊ С‡РµСЂРµР· await
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ" }, { status: 401 });
    }

    const isAllowed = await productRateLimiter.check(session.user.id);
    if (!isAllowed) {
      return NextResponse.json({ message: "РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРґРѕР¶РґРёС‚Рµ РјРёРЅСѓС‚Сѓ." }, { status: 429 });
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // РћР±РЅРѕРІР»СЏРµРј С‚РѕРІР°СЂ, С‚РѕР»СЊРєРѕ РµСЃР»Рё РѕРЅ РїСЂРёРЅР°РґР»РµР¶РёС‚ С‚РµРєСѓС‰РµРјСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ
    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
        userId: session.user.id, // Р—Р°С‰РёС‚Р° РѕС‚ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ С‡СѓР¶РёС… С‚РѕРІР°СЂРѕРІ
      },
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        price: validatedData.price,
        oldPrice: validatedData.oldPrice ?? null,
        category: validatedData.category || validatedData.categories?.[0] || "Разное",
        categories: validatedData.categories && validatedData.categories.length > 0
          ? validatedData.categories
          : [validatedData.category || validatedData.categories?.[0] || "Разное"],
        subCategory: validatedData.subCategory || null,
        sizes: validatedData.sizes || [],
        variants: validatedData.variants && validatedData.variants.length > 0 ? (validatedData.variants as any) : null,
        images: validatedData.images,
        availability: validatedData.availability || "В наличии",
      },
    });

    revalidatePath("/");
    revalidatePath(`/product/${id}`);
    revalidatePath("/dashboard/products");
    revalidateTag("products");

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "РћС€РёР±РєР° РІР°Р»РёРґР°С†РёРё", issues: error.issues },
        { status: 422 }
      );
    }
    
    // РћС€РёР±РєР° P2025 РѕР·РЅР°С‡Р°РµС‚, С‡С‚Рѕ Р·Р°РїРёСЃСЊ РЅРµ РЅР°Р№РґРµРЅР° (РёР»Рё С‡СѓР¶Р°СЏ)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ РёР»Рё Сѓ РІР°СЃ РЅРµС‚ РїСЂР°РІ РЅР° РµРіРѕ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ" },
        { status: 404 }
      );
    }

    console.error("[PRODUCT_PATCH]", error);
    return NextResponse.json(
      { message: "Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°" },
      { status: 500 }
    );
  }
}

// РЈРґР°Р»РµРЅРёРµ С‚РѕРІР°СЂР° (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Р’ РЅРѕРІС‹С… РІРµСЂСЃРёСЏС… Next.js params РЅСѓР¶РЅРѕ СЂР°СЃРїР°РєРѕРІС‹РІР°С‚СЊ С‡РµСЂРµР· await
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ" }, { status: 401 });
    }

    const isAllowed = await productRateLimiter.check(session.user.id);
    if (!isAllowed) {
      return NextResponse.json({ message: "РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРґРѕР¶РґРёС‚Рµ РјРёРЅСѓС‚Сѓ." }, { status: 429 });
    }

    // Находим товар перед удалением, чтобы удалить фото из Cloudinary
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        images: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Товар не найден или у вас нет прав на его удаление" },
        { status: 404 }
      );
    }

    if (existingProduct.images && existingProduct.images.length > 0) {
      try {
        await deleteProductImagesFromCloudinary(existingProduct.images);
      } catch (cloudErr) {
        console.error("Ошибка при удалении фото из Cloudinary:", cloudErr);
      }
    }

    // Мягкое удаление с очисткой массива картинок
    const deletedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
        status: "Удален",
        images: [],
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidateTag("products");

    return NextResponse.json(
      { message: "РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ СѓРґР°Р»РµРЅ", product: deletedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ РёР»Рё Сѓ РІР°СЃ РЅРµС‚ РїСЂР°РІ РЅР° РµРіРѕ СѓРґР°Р»РµРЅРёРµ" },
        { status: 404 }
      );
    }

    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json(
      { message: "Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°" },
      { status: 500 }
    );
  }
}