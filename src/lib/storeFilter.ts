/**
 * Фильтр для скрытия служебных, тестовых или админских магазинов из публичного каталога.
 */

export const HIDDEN_STORE_SLUGS = [
  "evitrina_pmr",
  "evitrina-admin-store",
  "e-vitrina-admin-store",
  "admin-store",
  "admin",
];

export const HIDDEN_STORE_PRISMA_NOT = [
  { slug: { in: HIDDEN_STORE_SLUGS } },
  { instagram: { in: ["evitrina_pmr", "@evitrina_pmr", "evitrina-admin-store"] } },
  { name: { contains: "E-Vitrina Admin", mode: "insensitive" as const } },
];

export function isHiddenStore(store: {
  slug?: string | null;
  instagram?: string | null;
  name?: string | null;
}): boolean {
  if (store.name && /e-vitrina\s+admin/i.test(store.name)) return true;
  if (store.slug && HIDDEN_STORE_SLUGS.includes(store.slug.toLowerCase())) return true;
  if (
    store.instagram &&
    HIDDEN_STORE_SLUGS.includes(store.instagram.toLowerCase().replace(/^@/, ""))
  ) {
    return true;
  }
  return false;
}
