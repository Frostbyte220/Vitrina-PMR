import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/validations/product";
import { isHiddenStore } from "@/lib/storeFilter";
import { getFuzzySuggestions, getFuzzyStores, getRussianStem } from "@/lib/fuzzySearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], stores: [], categories: [], suggestions: [] });
  }

  try {
    const [products, stores] = await Promise.all([
      // 1. Умный поиск товаров (с учётом опечаток, падежей и брендов)
      getFuzzySuggestions(q, 6),

      // 2. Умный поиск магазинов
      getFuzzyStores(q, 3),
    ]);

    // 3. Подбор подходящих категорий (с учётом корня слова)
    const stem = getRussianStem(q.toLowerCase());
    const matchingCategories = CATEGORIES.filter((cat) => {
      const lowerCat = cat.toLowerCase();
      const lowerQ = q.toLowerCase();
      return (
        lowerCat.includes(lowerQ) ||
        (stem.length >= 3 && lowerCat.includes(stem))
      );
    }).slice(0, 3);

    return NextResponse.json({
      products,
      stores: stores.filter((s) => !isHiddenStore(s)),
      categories: matchingCategories,
      suggestions: products, // обратная совместимость
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ products: [], stores: [], categories: [], suggestions: [] }, { status: 500 });
  }
}
