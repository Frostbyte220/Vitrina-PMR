import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking candidate URLs for broken products...");

  const candidates = {
    charger: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
    serum: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    patches: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
  };

  for (const [key, url] of Object.entries(candidates)) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL [${key}]: ${res.status} (${url})`);
    } catch (e: any) {
      console.log(`URL [${key}] ERR: ${e.message}`);
    }
  }

  // 1. Обновляем товар «Беспроводная зарядная станция 3-в-1 MagSafe»
  const p1 = await prisma.product.updateMany({
    where: { title: { contains: "Беспроводная зарядная станция" } },
    data: {
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80"],
    },
  });
  console.log(`Updated charger: ${p1.count}`);

  // 2. Обновляем товар «Набор сывороток The Ordinary Niacinamide + Zinc»
  // Используем проверенное фото сыворотки/ухода
  const p2 = await prisma.product.updateMany({
    where: { title: { contains: "The Ordinary Niacinamide" } },
    data: {
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
    },
  });
  console.log(`Updated serum: ${p2.count}`);

  // 3. Обновляем товар «Гидрогелевые патчи для глаз с золотом и муцином»
  // Используем проверенное фото косметического ухода
  const p3 = await prisma.product.updateMany({
    where: { title: { contains: "Гидрогелевые патчи" } },
    data: {
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"],
    },
  });
  console.log(`Updated patches: ${p3.count}`);

  // Проверяем все товары после обновления
  console.log("Verifying all products now...");
  const all = await prisma.product.findMany({
    select: { title: true, images: true },
  });

  let brokenCount = 0;
  for (const prod of all) {
    for (const img of prod.images || []) {
      try {
        const res = await fetch(img, { method: "HEAD" });
        if (res.status !== 200) {
          console.warn(`⚠️ BROKEN (${res.status}): "${prod.title}" -> ${img}`);
          brokenCount++;
        }
      } catch (e: any) {
        console.warn(`⚠️ ERROR: "${prod.title}" -> ${img} (${e.message})`);
        brokenCount++;
      }
    }
  }

  if (brokenCount === 0) {
    console.log("🎉 ALL PRODUCT IMAGES RETURN 200 OK!");
  } else {
    console.log(`⚠️ Found ${brokenCount} broken images.`);
  }
}

main().catch(console.error);
