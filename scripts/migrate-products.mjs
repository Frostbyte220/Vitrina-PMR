/**
 * Скрипт миграции существующих товаров.
 * 
 * Что делает:
 * 1. Привязывает товары к storeId (если у пользователя есть Store, но у товара нет storeId)
 * 2. Заполняет subCategory = "Для женщин" для Одежды/Обуви/Спорт без подкатегории
 * 3. Для Одежды без sizes[] — оставляет пустым (продавцы заполнят сами)
 * 
 * Запуск:
 *   node scripts/migrate-products.mjs
 * 
 * Требует: DATABASE_URL и DIRECT_URL в .env или .env.local
 */

import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, join } from "path";

// Загружаем .env.local вручную
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    try {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
      console.log(`✅ Загружены переменные из ${file}`);
    } catch {
      // файл не найден — пропускаем
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log("\n🚀 Старт миграции существующих товаров...\n");

  // 1. Получаем все магазины с userId
  const stores = await prisma.store.findMany({
    select: { id: true, userId: true },
  });
  const storeByUserId = new Map(stores.map((s) => [s.userId, s.id]));
  console.log(`📦 Найдено магазинов: ${stores.length}`);

  // 2. Получаем все активные товары
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      category: true,
      subCategory: true,
      sizes: true,
      storeId: true,
      userId: true,
    },
  });
  console.log(`🛍️  Найдено товаров: ${products.length}\n`);

  let updatedStoreId = 0;
  let updatedSubCategory = 0;
  let alreadyOk = 0;

  for (const product of products) {
    const updates = {};

    // --- Задача 1: Привязать к storeId ---
    if (!product.storeId && product.userId) {
      const storeId = storeByUserId.get(product.userId);
      if (storeId) {
        updates.storeId = storeId;
        updatedStoreId++;
      }
    }

    // --- Задача 2: subCategory для категорий, которые её поддерживают ---
    const subCatCategories = ["Одежда", "Обувь", "Спорт и отдых", "Косметика", "Парфюмерия"];
    if (
      subCatCategories.includes(product.category) &&
      (!product.subCategory || product.subCategory === "")
    ) {
      // Ставим нейтральный дефолт — продавец сможет уточнить при редактировании
      updates.subCategory = "Для женщин";
      updatedSubCategory++;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
    } else {
      alreadyOk++;
    }
  }

  console.log("✅ Итоги миграции:");
  console.log(`   storeId привязан:        ${updatedStoreId} товаров`);
  console.log(`   subCategory установлена: ${updatedSubCategory} товаров`);
  console.log(`   Без изменений:           ${alreadyOk} товаров`);
  console.log("\n🎉 Готово!\n");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка миграции:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
