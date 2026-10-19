/**
 * Утилита нечёткого поиска товаров и магазинов через pg_trgm (PostgreSQL)
 * с поддержкой русской морфологии (стемминг падежей/множественного числа)
 * и транслитерации популярных брендов (найк -> nike, адидас -> adidas и др.).
 */
import { prisma } from "@/lib/prisma";
import { BRAND_SYNONYMS, getRussianStem } from "@/lib/searchUtils";

export { BRAND_SYNONYMS, getRussianStem };

/** Нормализация строки запроса */
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export type FuzzyProduct = {
  id: string;
  title: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  category: string;
  subCategory: string | null;
  sizes: string[];
  user: {
    name: string | null;
    instagram: string | null;
    avatar: string | null;
    store: {
      name: string;
      slug: string;
      instagram: string | null;
      avatarUrl: string | null;
      cities: string[];
      phone: string | null;
      telegram: string | null;
      viber: string | null;
      isVerified: boolean;
    } | null;
  } | null;
  store: {
    name: string;
    slug: string;
    instagram: string | null;
    avatarUrl: string | null;
    cities: string[];
    phone: string | null;
    telegram: string | null;
    viber: string | null;
    isVerified: boolean;
  } | null;
};

/**
 * Нечёткий поиск товаров в основном каталоге.
 *
 * @param query        Строка поиска от пользователя
 * @param extraWhere   Дополнительные фильтры (категории, города, цены, скидки)
 * @param skip         Смещение для пагинации
 * @param take         Кол-во товаров на страницу
 * @param orderBy      Сортировка Prisma (если выбрана пользователем)
 * @param isCustomSort Флаг, указал ли пользователь кастомную сортировку (цена, дата)
 */
export async function getFuzzyProducts(
  query: string,
  extraWhere: Record<string, unknown> = {},
  skip = 0,
  take = 12,
  orderBy: Record<string, string> = { createdAt: "desc" },
  isCustomSort = false
): Promise<[FuzzyProduct[], number]> {
  const q = normalizeQuery(query);
  if (!q) return [[], 0];

  const synonym = BRAND_SYNONYMS[q] || null;
  const stem = getRussianStem(q);
  const stemQuery = stem.length >= 3 && stem !== q ? stem : null;

  // 1. Поиск релевантных ID через pg_trgm + ILIKE + бренды/стемминг
  const candidates = await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
    `
    SELECT id,
           GREATEST(
             word_similarity($1, title),
             word_similarity($1, COALESCE(description, '')) * 0.7,
             COALESCE(word_similarity($2, title), 0) * 0.95,
             COALESCE(word_similarity($2, COALESCE(description, '')) * 0.65, 0),
             COALESCE(word_similarity($3, title), 0) * 0.9,
             COALESCE(word_similarity($3, COALESCE(description, '')) * 0.6, 0)
           ) AS score
    FROM "Product"
    WHERE
      status = 'Активен'
      AND "deletedAt" IS NULL
      AND (
        -- Схожесть по триграммам для основного запроса
        word_similarity($1, title) > 0.25
        OR word_similarity($1, COALESCE(description, '')) > 0.35
        -- Точное или подстрочное совпадение
        OR title ILIKE '%' || $1 || '%'
        OR COALESCE(description, '') ILIKE '%' || $1 || '%'
        -- Синоним бренда (найк -> nike)
        OR ($2 IS NOT NULL AND (
          word_similarity($2, title) > 0.25
          OR word_similarity($2, COALESCE(description, '')) > 0.35
          OR title ILIKE '%' || $2 || '%'
        ))
        -- Стемминг русской основы (куртки -> куртк)
        OR ($3 IS NOT NULL AND (
          word_similarity($3, title) > 0.25
          OR title ILIKE '%' || $3 || '%'
        ))
      )
    ORDER BY score DESC
    LIMIT 200
    `,
    q,
    synonym,
    stemQuery
  );

  if (candidates.length === 0) return [[], 0];

  const candidateIds = candidates.map((c) => c.id);
  const scoreMap = new Map(candidates.map((c) => [c.id, Number(c.score)]));

  // 2. Строим условия фильтрации Prisma
  const andConditions: Record<string, unknown>[] = [
    { id: { in: candidateIds } },
  ];

  if (extraWhere.AND && Array.isArray(extraWhere.AND)) {
    andConditions.push(...(extraWhere.AND as Record<string, unknown>[]));
  }

  const whereClause: any = {
    deletedAt: null,
    status: "Активен",
    AND: andConditions,
  };

  // 3. Выборка подходящих ID с учётом всех фильтров
  if (isCustomSort) {
    // Если пользователь выбрал сортировку (по цене / дате), используем её
    const totalCount = await prisma.product.count({ where: whereClause });
    if (totalCount === 0) return [[], 0];

    const products = await prisma.product.findMany({
      where: whereClause,
      select: productSelectFields,
      skip,
      take,
      orderBy,
    });

    return [products as FuzzyProduct[], totalCount];
  }

  // По умолчанию: сортируем по релевантности (score DESC)
  const matchingItems = await prisma.product.findMany({
    where: whereClause,
    select: { id: true },
  });

  const totalCount = matchingItems.length;
  if (totalCount === 0) return [[], 0];

  // Сортируем все совпавшие ID по убыванию релевантности
  matchingItems.sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

  // Пагинация по срезу ID
  const pageIds = matchingItems.slice(skip, skip + take).map((i) => i.id);
  if (pageIds.length === 0) return [[], totalCount];

  const products = await prisma.product.findMany({
    where: { id: { in: pageIds } },
    select: productSelectFields,
  });

  // Восстанавливаем порядок по убыванию релевантности для текущей страницы
  const pageOrder = new Map(pageIds.map((id, index) => [id, index]));
  products.sort((a, b) => (pageOrder.get(a.id) ?? 0) - (pageOrder.get(b.id) ?? 0));

  return [products as FuzzyProduct[], totalCount];
}

/**
 * Нечёткий поиск для живого автодополнения (search suggestions).
 */
export async function getFuzzySuggestions(
  query: string,
  take = 6
) {
  const q = normalizeQuery(query);
  if (!q) return [];

  const synonym = BRAND_SYNONYMS[q] || null;
  const stem = getRussianStem(q);
  const stemQuery = stem.length >= 3 && stem !== q ? stem : null;

  const candidates = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `
    SELECT id
    FROM "Product"
    WHERE
      status = 'Активен'
      AND "deletedAt" IS NULL
      AND (
        word_similarity($1, title) > 0.25
        OR title ILIKE '%' || $1 || '%'
        OR ($2 IS NOT NULL AND (
          word_similarity($2, title) > 0.25
          OR title ILIKE '%' || $2 || '%'
        ))
        OR ($3 IS NOT NULL AND (
          word_similarity($3, title) > 0.25
          OR title ILIKE '%' || $3 || '%'
        ))
      )
    ORDER BY GREATEST(
      word_similarity($1, title),
      COALESCE(word_similarity($2, title), 0),
      COALESCE(word_similarity($3, title), 0)
    ) DESC, "createdAt" DESC
    LIMIT $4
    `,
    q,
    synonym,
    stemQuery,
    take * 2
  );

  if (candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id).slice(0, take);

  const products = await prisma.product.findMany({
    where: { id: { in: candidateIds }, status: "Активен", deletedAt: null },
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      category: true,
      sizes: true,
      store: { select: { name: true, slug: true, avatarUrl: true, isVerified: true } },
      user: {
        select: {
          name: true,
          instagram: true,
          avatar: true,
          store: { select: { name: true, slug: true, avatarUrl: true, isVerified: true } },
        },
      },
    },
  });

  const orderMap = new Map(candidateIds.map((id, index) => [id, index]));
  products.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  return products;
}

/**
 * Нечёткий поиск магазинов для автодополнения (search suggestions).
 */
export async function getFuzzyStores(query: string, take = 3) {
  const q = normalizeQuery(query);
  if (!q) return [];

  const candidates = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `
    SELECT id
    FROM "Store"
    WHERE
      word_similarity($1, name) > 0.25
      OR name ILIKE '%' || $1 || '%'
      OR slug ILIKE '%' || $1 || '%'
      OR COALESCE(instagram, '') ILIKE '%' || $1 || '%'
    ORDER BY word_similarity($1, name) DESC
    LIMIT $2
    `,
    q,
    take * 2
  );

  if (candidates.length === 0) return [];

  const ids = candidates.map((c) => c.id).slice(0, take);

  return prisma.store.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      instagram: true,
      avatarUrl: true,
      cities: true,
      isVerified: true,
      _count: {
        select: { products: { where: { status: "Активен", deletedAt: null } } },
      },
    },
  });
}

const productSelectFields = {
  id: true,
  title: true,
  price: true,
  oldPrice: true,
  images: true,
  category: true,
  subCategory: true,
  sizes: true,
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
          phone: true,
          telegram: true,
          viber: true,
          isVerified: true,
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
      phone: true,
      telegram: true,
      viber: true,
      isVerified: true,
    },
  },
};
