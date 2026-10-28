import { NextResponse } from "next/server";
import { getProducts } from "@/lib/cache";
import { getFuzzyProducts } from "@/lib/fuzzySearch";

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
    conditions.push({ category });
  }
  if (sub) {
    conditions.push({ subCategory: sub });
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
