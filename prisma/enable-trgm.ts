/**
 * Скрипт для включения расширения pg_trgm на Neon PostgreSQL
 * и создания триграммных индексов для быстрого нечёткого поиска.
 *
 * Запуск: npx tsx prisma/enable-trgm.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Включаем расширение pg_trgm...");
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  console.log("✅ Расширение pg_trgm включено");

  // CREATE INDEX CONCURRENTLY нельзя выполнить внутри транзакции Prisma.
  // Используем обычный CREATE INDEX — он атомарен и безопасен для нашей БД.
  console.log("📐 Создаём триграммный индекс для поля title...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS product_title_trgm_idx
    ON "Product" USING GIN (title gin_trgm_ops);
  `);
  console.log("✅ Индекс product_title_trgm_idx создан");

  console.log("📐 Создаём триграммный индекс для поля description...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS product_desc_trgm_idx
    ON "Product" USING GIN (description gin_trgm_ops);
  `);
  console.log("✅ Индекс product_desc_trgm_idx создан");

  console.log("📐 Создаём триграммный индекс для названия магазинов...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS store_name_trgm_idx
    ON "Store" USING GIN (name gin_trgm_ops);
  `);
  console.log("✅ Индекс store_name_trgm_idx создан");

  console.log("🎉 Готово! pg_trgm успешно настроен.");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
