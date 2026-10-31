/**
 * fix-broken-images.ts — точечное исправление невалидных Unsplash ID
 * Только те товары, у которых первая картинка не грузится
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

// ─── 100% подтверждённые рабочие ID ─────────────────
const OK = {
  // Кроссовки
  shoe_nike:    "1542291026-7eec264c27ff",  // белые Nike AF1 (суперизвестное фото)
  shoe_bw:      "1530217784-9e7d9d8b1e5d",  // кроссовок чёрно-белый

  // Одежда мужская / унисекс
  shirt_man:    "1548549557-dbe9946621da",  // деловой костюм / рубашка
  jacket:       "1548126032-079a0fb0099d",  // джинсовая куртка vintage

  // Украшения — используем fashion-фото (лучше fashion, чем пусто)
  jewel_a:      "1515372039744-b8f02a3ae446", // платье с украшениями
  jewel_b:      "1496747473792-bae8f3f6b9c8", // fashion крупный план

  // Fashon generic
  fashion:      "1483985988355-763728e1935b", // модный образ с аксессуарами
};

// ─── Только сломанные товары ─────────────────────────
const FIXES: Array<{ slug: string; title: string; images: string[] }> = [
  // SneakerHub PMR — Adidas, NB, Puma, Носки
  { slug: "sneakerhub_pmr", title: "Adidas Ultraboost 22",         images: [u(OK.shoe_nike), u(OK.shoe_nike)] },
  { slug: "sneakerhub_pmr", title: "New Balance 574 Grey",         images: [u(OK.shoe_nike), u(OK.shoe_nike)] },
  { slug: "sneakerhub_pmr", title: "Puma RS-X Bold",               images: [u(OK.shoe_nike), u(OK.shoe_nike)] },
  { slug: "sneakerhub_pmr", title: "Носки Nike (набор 6 пар)",     images: [u(OK.shoe_nike)] },

  // Vintage PMR — рубашка и свитшот
  { slug: "vintage_pmr", title: "Рубашка Ralph Lauren Oxford",     images: [u(OK.shirt_man), u(OK.jacket)] },
  { slug: "vintage_pmr", title: "Tommy Hilfiger свитшот (L)",      images: [u(OK.jacket),    u(OK.fashion)] },
  { slug: "vintage_pmr", title: "Ремень кожаный Polo Ralph Lauren",images: [u(OK.jacket)] },

  // Jewelry Tiraspol — все украшения
  { slug: "jewelry_tiraspol", title: "Кольцо серебро 925 «Волна»", images: [u(OK.jewel_a), u(OK.jewel_b)] },
  { slug: "jewelry_tiraspol", title: "Серьги позолота «Tiny Stars»",images: [u(OK.jewel_b), u(OK.jewel_a)] },
  { slug: "jewelry_tiraspol", title: "Цепочка «Herringbone» золото",images: [u(OK.jewel_a), u(OK.jewel_b)] },
  { slug: "jewelry_tiraspol", title: "Браслет «Pearl» жемчуг",     images: [u(OK.jewel_b), u(OK.jewel_a)] },
  { slug: "jewelry_tiraspol", title: "Подвеска «Moon» серебро 925", images: [u(OK.jewel_a), u(OK.jewel_b)] },
  { slug: "jewelry_tiraspol", title: "Набор украшений «Gift Set»",  images: [u(OK.jewel_b), u(OK.jewel_a)] },
];

// Исправить аватар / обложку jewelry (тоже сломаны)
const STORE_FIXES: Array<{ slug: string; avatarUrl: string; coverUrl: string }> = [
  {
    slug: "jewelry_tiraspol",
    avatarUrl: u(OK.jewel_a, 200, 200),
    coverUrl:  u(OK.jewel_b, 1200, 400),
  },
];

async function main() {
  console.log("🔧 Точечное исправление сломанных изображений...\n");

  // Исправляем аватары/обложки магазинов
  for (const s of STORE_FIXES) {
    const store = await prisma.store.findUnique({ where: { slug: s.slug } });
    if (!store) { console.log(`⚠️  ${s.slug} не найден`); continue; }
    await prisma.store.update({ where: { slug: s.slug }, data: { avatarUrl: s.avatarUrl, coverUrl: s.coverUrl } });
    await prisma.user.update({ where: { id: store.userId }, data: { avatar: s.avatarUrl } });
    console.log(`🏪 ${s.slug} — аватар и обложка`);
  }

  // Исправляем товары
  for (const fix of FIXES) {
    const store = await prisma.store.findUnique({ where: { slug: fix.slug } });
    if (!store) { console.log(`⚠️  Магазин не найден: ${fix.slug}`); continue; }

    const product = await prisma.product.findFirst({
      where: { storeId: store.id, title: fix.title },
    });
    if (!product) { console.log(`  ⚠️  Товар не найден: "${fix.title}"`); continue; }

    await prisma.product.update({ where: { id: product.id }, data: { images: fix.images } });
    console.log(`  ✅ "${fix.title}"`);
  }

  console.log("\n🎉 Готово!");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
