/**
 * update-images v2 — только заведомо рабочие Unsplash photo ID
 * Запуск: npx tsx prisma/update-images.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Базовый хелпер Unsplash
const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

// ──────────────────────────────────────────
// Банк надёжных ID по категориям
// ──────────────────────────────────────────
const IMG = {
  // Кроссовки / обувь
  sneaker1: "1542291026-7eec264c27ff",   // Nike AF1 белые на розовом
  sneaker2: "1491553154-8783edc8b5b4",   // пара кроссовок сбоку
  sneaker3: "1556906781-9feca0d7a5aa",   // кроссовки на белом
  sneaker4: "1600269452121-4f2416e55c28", // Jordan красно-чёрные

  // Женская одежда
  dress1:   "1515372039744-b8f02a3ae446", // платье розовое миди
  dress2:   "1496747473792-bae8f3f6b9c8", // платье на модели
  fashion1: "1548549557-dbe9946621da",    // деловой костюм / блейзер
  fashion2: "1483985988355-763728e1935b", // модная одежда в магазине
  coat1:    "1539533113208-f19d8573d1ea", // пальто осеннее
  knit1:    "1434389677669-e08b4cac3105", // вязаный свитер
  pants1:   "1509631179647-0177331693ae", // чёрные брюки

  // Детская одежда
  kids1:    "1622290291468-a28f7a7dc6a8", // ребёнок в цветной одежде
  kids2:    "1476703480864-28e0fa1b7f68", // ребёнок на прогулке
  kids3:    "1503454537195-1dcabb73ffb9", // детские вещи

  // Сумки / аксессуары
  bag1:     "1548036328-c9fa89d128fa",    // коричневая кожаная сумка
  bag2:     "1553062407-98eeb64c6a62",    // рюкзак городской
  bag3:     "1584917865442-de89df76afd3", // клатч / вечерняя сумочка
  bag4:     "1590874103328-eac38a683ce7", // сумка тоут

  // Спорт
  sport1:   "1517836357463-d25dfeac3438", // тренировочный зал
  sport2:   "1571019613454-1cb2f99b2d8b", // бегун
  sport3:   "1594381898411-846e7d193883", // леггинсы / тренировка
  sport4:   "1506126613408-eca07ce68773", // йога-коврик

  // Косметика / красота
  beauty1:  "1512496015851-a90fb38ba796", // палетка теней
  beauty2:  "1522335789203-aabd1fc54bc9", // девушка с макияжем
  beauty3:  "1541643600914-78b084683702", // флакон духов
  beauty4:  "1596462502278-27bfdc403348", // баночки с кремом

  // Украшения
  jewel1:   "1535632066927-ab7c9ab60418", // кольца / украшения
  jewel2:   "1611591437281-460bfbe1220a", // золотая цепочка
  jewel3:   "1599643478518-a784e5dc4c8f", // браслет

  // Винтаж
  vintage1: "1548126032-079a0fb0099d",    // джинсовая куртка
  vintage2: "1490481651871-ab68de25d43d", // винтажная мода
  vintage3: "1503341504-d2517090c9b2",    // vintage одежда

  // Обложки магазинов
  coverShoes:    "1542291026-7eec264c27ff",
  coverFashion:  "1483985988355-763728e1935b",
  coverKids:     "1476703480864-28e0fa1b7f68",
  coverBags:     "1553062407-98eeb64c6a62",
  coverSport:    "1517836357463-d25dfeac3438",
  coverBeauty:   "1522335789203-aabd1fc54bc9",
  coverJewel:    "1535632066927-ab7c9ab60418",
  coverVintage:  "1490481651871-ab68de25d43d",
};

const DATA: Record<string, {
  avatarUrl: string;
  coverUrl:  string;
  products:  Record<string, string[]>;
}> = {

  sneakerhub_pmr: {
    avatarUrl: u(IMG.sneaker1, 200, 200),
    coverUrl:  u(IMG.coverShoes, 1200, 400),
    products: {
      "Nike Air Force 1 White":          [u(IMG.sneaker1), u(IMG.sneaker2), u(IMG.sneaker3)],
      "Adidas Ultraboost 22":            [u(IMG.sneaker2), u(IMG.sneaker3)],
      "New Balance 574 Grey":            [u(IMG.sneaker3), u(IMG.sneaker2)],
      "Nike Jordan 1 Retro High OG":     [u(IMG.sneaker4), u(IMG.sneaker1), u(IMG.sneaker2)],
      "Puma RS-X Bold":                  [u(IMG.sneaker3), u(IMG.sneaker1)],
      "Носки Nike (набор 6 пар)":        [u(IMG.sneaker2)],
    },
  },

  elegance_tiraspol: {
    avatarUrl: u(IMG.dress1, 200, 200),
    coverUrl:  u(IMG.coverFashion, 1200, 400),
    products: {
      "Платье миди «Вечерняя роза»":     [u(IMG.dress1),   u(IMG.dress2),   u(IMG.fashion2)],
      "Костюм деловой «Linen Beige»":    [u(IMG.fashion1), u(IMG.fashion2)],
      "Блуза «Silk Touch» белая":        [u(IMG.fashion2), u(IMG.dress2)],
      "Юбка плиссе «Champagne»":         [u(IMG.dress2),   u(IMG.fashion1)],
      "Пальто «Camel Wool» осеннее":     [u(IMG.coat1),    u(IMG.fashion1), u(IMG.fashion2)],
      "Джемпер ribbed «Dusty Rose»":     [u(IMG.knit1),    u(IMG.dress1)],
      "Брюки «Wide Leg» чёрные":         [u(IMG.pants1),   u(IMG.fashion1)],
    },
  },

  kids_joy_pmr: {
    avatarUrl: u(IMG.kids1, 200, 200),
    coverUrl:  u(IMG.coverKids, 1200, 400),
    products: {
      "Комбинезон флисовый «Мишка» 62–74": [u(IMG.kids1), u(IMG.kids3)],
      "Кроссовки «Динозаврик» 20–25":       [u(IMG.sneaker3), u(IMG.sneaker2)],
      "Набор «Школьник» 7–9 лет":           [u(IMG.kids2), u(IMG.kids3)],
      "Платье «Балерина» для девочки":       [u(IMG.kids1), u(IMG.dress1)],
      "Пуховик детский «Arctic» 92–116":     [u(IMG.kids2), u(IMG.kids3)],
    },
  },

  bags_boutique_pmr: {
    avatarUrl: u(IMG.bag1, 200, 200),
    coverUrl:  u(IMG.coverBags, 1200, 400),
    products: {
      "Сумка тоут «Canvas Everyday»":    [u(IMG.bag4), u(IMG.bag1), u(IMG.bag3)],
      "Рюкзак кожаный «Urban»":          [u(IMG.bag2), u(IMG.bag1)],
      "Клатч «Evening» серебро":         [u(IMG.bag3), u(IMG.bag4)],
      "Поясная сумка «Fanny Pack»":      [u(IMG.bag2), u(IMG.bag1)],
      "Кошелёк «Mini» розовый":          [u(IMG.bag3)],
      "Сумка кросс-боди «Crossbody»":    [u(IMG.bag1), u(IMG.bag4), u(IMG.bag3)],
    },
  },

  sportlife_pmr: {
    avatarUrl: u(IMG.sport2, 200, 200),
    coverUrl:  u(IMG.coverSport, 1200, 400),
    products: {
      "Леггинсы Nike Pro 7/8":           [u(IMG.sport3), u(IMG.sport1)],
      "Футболка Adidas Aeroready":        [u(IMG.sport2), u(IMG.sport1)],
      "Шорты Under Armour":              [u(IMG.sport1), u(IMG.sport3)],
      "Кроссовки Asics Gel-Nimbus 25":   [u(IMG.sneaker2), u(IMG.sneaker3), u(IMG.sneaker1)],
      "Костюм Nike Club Fleece":         [u(IMG.sport1), u(IMG.sport2)],
      "Коврик для йоги 6 мм":            [u(IMG.sport4), u(IMG.sport3)],
    },
  },

  beauty_box_tiraspol: {
    avatarUrl: u(IMG.beauty1, 200, 200),
    coverUrl:  u(IMG.coverBeauty, 1200, 400),
    products: {
      "Парфюм Dior Sauvage EDP 100 мл":  [u(IMG.beauty3), u(IMG.beauty2)],
      "Крем La Roche-Posay Toleriane":    [u(IMG.beauty4), u(IMG.beauty2)],
      "Палетка Anastasia Beverly Hills":  [u(IMG.beauty1), u(IMG.beauty2), u(IMG.beauty3)],
      "Тушь L'Oréal Telescopic":         [u(IMG.beauty2)],
      "Сыворотка с витамином C Garnier":  [u(IMG.beauty4), u(IMG.beauty2)],
      "Набор Kerastase Nutritive":        [u(IMG.beauty2), u(IMG.beauty4)],
      "Фиксирующий спрей NYX Setting Spray": [u(IMG.beauty1)],
    },
  },

  jewelry_tiraspol: {
    avatarUrl: u(IMG.jewel1, 200, 200),
    coverUrl:  u(IMG.coverJewel, 1200, 400),
    products: {
      "Кольцо серебро 925 «Волна»":      [u(IMG.jewel1), u(IMG.jewel3)],
      "Серьги позолота «Tiny Stars»":    [u(IMG.jewel1), u(IMG.jewel2)],
      "Цепочка «Herringbone» золото":    [u(IMG.jewel2), u(IMG.jewel1)],
      "Браслет «Pearl» жемчуг":          [u(IMG.jewel3), u(IMG.jewel1)],
      "Подвеска «Moon» серебро 925":     [u(IMG.jewel1), u(IMG.jewel2)],
      "Набор украшений «Gift Set»":      [u(IMG.jewel1), u(IMG.jewel2)],
    },
  },

  vintage_pmr: {
    avatarUrl: u(IMG.vintage1, 200, 200),
    coverUrl:  u(IMG.coverVintage, 1200, 400),
    products: {
      "Куртка Levi's джинсовая (vintage)":  [u(IMG.vintage1), u(IMG.vintage3), u(IMG.vintage2)],
      "Рубашка Ralph Lauren Oxford":         [u(IMG.vintage3), u(IMG.fashion1)],
      "Сумка Coach кожаная (vintage)":       [u(IMG.bag1),     u(IMG.bag4),    u(IMG.bag3)],
      "Ремень кожаный Polo Ralph Lauren":    [u(IMG.vintage2)],
      "Tommy Hilfiger свитшот (L)":          [u(IMG.vintage3), u(IMG.fashion1)],
      "Очки Ray-Ban Wayfarer оригинал":      [u(IMG.vintage2), u(IMG.vintage3)],
    },
  },
};

async function main() {
  console.log("🖼  Обновление изображений (v2 — надёжные ID)...\n");

  for (const [slug, data] of Object.entries(DATA)) {
    const store = await prisma.store.findUnique({ where: { slug } });
    if (!store) { console.log(`⚠️  Не найден: ${slug}`); continue; }

    await prisma.store.update({
      where: { slug },
      data: { avatarUrl: data.avatarUrl, coverUrl: data.coverUrl },
    });
    await prisma.user.update({
      where: { id: store.userId },
      data: { avatar: data.avatarUrl },
    });

    let n = 0;
    for (const [title, images] of Object.entries(data.products)) {
      const product = await prisma.product.findFirst({
        where: { storeId: store.id, title },
      });
      if (!product) { console.log(`  ⚠️  Товар не найден: "${title}"`); continue; }
      await prisma.product.update({ where: { id: product.id }, data: { images } });
      n++;
    }

    console.log(`✅ ${slug} — ${n} товаров`);
  }

  console.log("\n🎉 Готово!");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
