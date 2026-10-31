/**
 * Обновляет изображения магазинов и товаров на тематические Unsplash-фото
 * Запуск: npx tsx prisma/update-images.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Unsplash: https://images.unsplash.com/photo-{ID}?w=600&h=600&fit=crop&q=80
const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const DATA: Record<string, {
  avatarUrl: string;
  coverUrl: string;
  products: Record<string, string[]>;
}> = {

  // ── SneakerHub PMR ──────────────────────────────────────────
  sneakerhub_pmr: {
    avatarUrl: u("1542291026-7eec264c27ff", 200, 200),
    coverUrl:  u("1542291026-7eec264c27ff", 1200, 400),
    products: {
      "Nike Air Force 1 White": [
        u("1542291026-7eec264c27ff"),
        u("1491553154-8783edc8b5b4"),
        u("1595950653106-bcd329dcd91c"),
      ],
      "Adidas Ultraboost 22": [
        u("1608231387042-66d1773d3028"),
        u("1556906781-9feca0d7a5aa"),
      ],
      "New Balance 574 Grey": [
        u("1539185441755-769473a23570"),
        u("1491553154-8783edc8b5b4"),
      ],
      "Nike Jordan 1 Retro High OG": [
        u("1600269452121-4f2416e55c28"),
        u("1552346154-21d32810aba3"),
        u("1597248374161-426f0d6d2fc9"),
      ],
      "Puma RS-X Bold": [
        u("1606107557195-0e29a4b5b4aa"),
        u("1542291026-7eec264c27ff"),
      ],
      "Носки Nike (набор 6 пар)": [
        u("1586350977771-b3b0abd50c82"),
      ],
    },
  },

  // ── Elegance Tiraspol ────────────────────────────────────────
  elegance_tiraspol: {
    avatarUrl: u("1515372039744-b8f02a3ae446", 200, 200),
    coverUrl:  u("1483985988355-763728e1935b", 1200, 400),
    products: {
      "Платье миди «Вечерняя роза»": [
        u("1515372039744-b8f02a3ae446"),
        u("1496747473792-bae8f3f6b9c8"),
        u("1518310952931-b1de897abd40"),
      ],
      "Костюм деловой «Linen Beige»": [
        u("1548549557-dbe9946621da"),
        u("1594938298603-c8148c4b2d5b"),
      ],
      "Блуза «Silk Touch» белая": [
        u("1603189343302-e603f7add05a"),
        u("1525507119028-ed4c629a60a3"),
      ],
      "Юбка плиссе «Champagne»": [
        u("1583744946564-b52ac1c389c8"),
        u("1594938298603-c8148c4b2d5b"),
      ],
      "Пальто «Camel Wool» осеннее": [
        u("1539533113208-f19d8573d1ea"),
        u("1544441893-675173f9a82e"),
        u("1548624149-f78b0da20588"),
      ],
      "Джемпер ribbed «Dusty Rose»": [
        u("1434389677669-e08b4cac3105"),
        u("1520975916090-8135e5391ece"),
      ],
      "Брюки «Wide Leg» чёрные": [
        u("1509631179647-0177331693ae"),
        u("1594938298603-c8148c4b2d5b"),
      ],
    },
  },

  // ── Kids Joy PMR ─────────────────────────────────────────────
  kids_joy_pmr: {
    avatarUrl: u("1622290291468-a28f7a7dc6a8", 200, 200),
    coverUrl:  u("1476703480864-28e0fa1b7f68", 1200, 400),
    products: {
      "Комбинезон флисовый «Мишка» 62–74": [
        u("1622290291468-a28f7a7dc6a8"),
        u("1503454537195-1dcabb73ffb9"),
      ],
      "Кроссовки «Динозаврик» 20–25": [
        u("1560769629-975ec94e6a86"),
        u("1542291026-7eec264c27ff"),
      ],
      "Набор «Школьник» 7–9 лет": [
        u("1632953187638-6264b1e72e20"),
        u("1545558014-8692077e9b5c"),
      ],
      "Платье «Балерина» для девочки": [
        u("1518611012118-696072aa579a"),
        u("1545558014-8692077e9b5c"),
      ],
      "Пуховик детский «Arctic» 92–116": [
        u("1516912481800-cf5e828ab326"),
        u("1503454537195-1dcabb73ffb9"),
      ],
    },
  },

  // ── Bags Boutique PMR ────────────────────────────────────────
  bags_boutique_pmr: {
    avatarUrl: u("1548036328-c9fa89d128fa", 200, 200),
    coverUrl:  u("1553062407-98eeb64c6a62", 1200, 400),
    products: {
      "Сумка тоут «Canvas Everyday»": [
        u("1548036328-c9fa89d128fa"),
        u("1590874103328-eac38a683ce7"),
        u("1594938298603-c8148c4b2d5b"),
      ],
      "Рюкзак кожаный «Urban»": [
        u("1553062407-98eeb64c6a62"),
        u("1622560480605-d83c853bc5be"),
      ],
      "Клатч «Evening» серебро": [
        u("1566150905458-1bf1fc113f0d"),
        u("1584917865442-de89df76afd3"),
      ],
      "Поясная сумка «Fanny Pack»": [
        u("1547949003-9792a18a2601"),
        u("1553062407-98eeb64c6a62"),
      ],
      "Кошелёк «Mini» розовый": [
        u("1627123364130-b7f1e0e32d8f"),
      ],
      "Сумка кросс-боди «Crossbody»": [
        u("1594938298603-c8148c4b2d5b"),
        u("1548036328-c9fa89d128fa"),
        u("1584917865442-de89df76afd3"),
      ],
    },
  },

  // ── SportLife PMR ────────────────────────────────────────────
  sportlife_pmr: {
    avatarUrl: u("1571019613454-1cb2f99b2d8b", 200, 200),
    coverUrl:  u("1517836357463-d25dfeac3438", 1200, 400),
    products: {
      "Леггинсы Nike Pro 7/8": [
        u("1594381898411-846e7d193883"),
        u("1517836357463-d25dfeac3438"),
      ],
      "Футболка Adidas Aeroready": [
        u("1571019613454-1cb2f99b2d8b"),
        u("1523381210434-271e8be8a52b"),
      ],
      "Шорты Under Armour": [
        u("1542291026-7eec264c27ff"),
        u("1504674900247-0877df9cc836"),
      ],
      "Кроссовки Asics Gel-Nimbus 25": [
        u("1595950653106-bcd329dcd91c"),
        u("1491553154-8783edc8b5b4"),
        u("1542291026-7eec264c27ff"),
      ],
      "Костюм Nike Club Fleece": [
        u("1556906781-9feca0d7a5aa"),
        u("1517836357463-d25dfeac3438"),
      ],
      "Коврик для йоги 6 мм": [
        u("1506126613408-eca07ce68773"),
        u("1575052814086-f385e2e2ad1b"),
      ],
    },
  },

  // ── Beauty Box Tiraspol ──────────────────────────────────────
  beauty_box_tiraspol: {
    avatarUrl: u("1512496015851-a90fb38ba796", 200, 200),
    coverUrl:  u("1522335789203-aabd1fc54bc9", 1200, 400),
    products: {
      "Парфюм Dior Sauvage EDP 100 мл": [
        u("1541643600914-78b084683702"),
        u("1563170351-be48da9a3b6b"),
      ],
      "Крем La Roche-Posay Toleriane": [
        u("1596462502278-27bfdc403348"),
        u("1570194065650-d99fb4b8ccb0"),
      ],
      "Палетка Anastasia Beverly Hills": [
        u("1512496015851-a90fb38ba796"),
        u("1522335789203-aabd1fc54bc9"),
        u("1586495777744-4e6b90a6d1bc"),
      ],
      "Тушь L'Oréal Telescopic": [
        u("1586495777744-4e6b90a6d1bc"),
      ],
      "Сыворотка с витамином C Garnier": [
        u("1596462502278-27bfdc403348"),
        u("1570194065650-d99fb4b8ccb0"),
      ],
      "Набор Kerastase Nutritive": [
        u("1522337360788-8b13dee7a37e"),
        u("1559599238-308793637427"),
      ],
      "Фиксирующий спрей NYX Setting Spray": [
        u("1522335789203-aabd1fc54bc9"),
      ],
    },
  },

  // ── Jewelry Tiraspol ─────────────────────────────────────────
  jewelry_tiraspol: {
    avatarUrl: u("1605100804763-247f67b3557e", 200, 200),
    coverUrl:  u("1611591437281-460bfbe1220a", 1200, 400),
    products: {
      "Кольцо серебро 925 «Волна»": [
        u("1605100804763-247f67b3557e"),
        u("1601121141499-d2baa1011ead"),
      ],
      "Серьги позолота «Tiny Stars»": [
        u("1630019852942-f89202989a59"),
        u("1535632066927-ab7c9ab60418"),
      ],
      "Цепочка «Herringbone» золото": [
        u("1611591437281-460bfbe1220a"),
        u("1601121141499-d2baa1011ead"),
      ],
      "Браслет «Pearl» жемчуг": [
        u("1599643478518-a784e5dc4c8f"),
        u("1535632066927-ab7c9ab60418"),
      ],
      "Подвеска «Moon» серебро 925": [
        u("1601121141499-d2baa1011ead"),
        u("1605100804763-247f67b3557e"),
      ],
      "Набор украшений «Gift Set»": [
        u("1535632066927-ab7c9ab60418"),
        u("1611591437281-460bfbe1220a"),
      ],
    },
  },

  // ── Vintage Corner PMR ───────────────────────────────────────
  vintage_pmr: {
    avatarUrl: u("1490481651871-ab68de25d43d", 200, 200),
    coverUrl:  u("1490481651871-ab68de25d43d", 1200, 400),
    products: {
      "Куртка Levi's джинсовая (vintage)": [
        u("1548126032-079a0fb0099d"),
        u("1503341504-d2517090c9b2"),
        u("1490481651871-ab68de25d43d"),
      ],
      "Рубашка Ralph Lauren Oxford": [
        u("1581803118522-7b72a50f7e9f"),
        u("1503341504-d2517090c9b2"),
      ],
      "Сумка Coach кожаная (vintage)": [
        u("1548036328-c9fa89d128fa"),
        u("1584917865442-de89df76afd3"),
        u("1590874103328-eac38a683ce7"),
      ],
      "Ремень кожаный Polo Ralph Lauren": [
        u("1624913503473-c1b8a4d0c1d6"),
      ],
      "Tommy Hilfiger свитшот (L)": [
        u("1548549557-dbe9946621da"),
        u("1503341504-d2517090c9b2"),
      ],
      "Очки Ray-Ban Wayfarer оригинал": [
        u("1511499767868-f1b7e3f10c87"),
        u("1572635196237-14b3f281503f"),
      ],
    },
  },
};

async function main() {
  console.log("🖼  Обновление изображений магазинов и товаров...\n");

  for (const [slug, data] of Object.entries(DATA)) {
    // Обновляем Store
    const store = await prisma.store.findUnique({ where: { slug } });
    if (!store) {
      console.log(`⚠️  Магазин не найден: ${slug}`);
      continue;
    }

    await prisma.store.update({
      where: { slug },
      data: {
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
      },
    });

    // Обновляем аватар User
    await prisma.user.update({
      where: { id: store.userId },
      data: { avatar: data.avatarUrl },
    });

    // Обновляем товары
    let updatedProducts = 0;
    for (const [title, images] of Object.entries(data.products)) {
      const product = await prisma.product.findFirst({
        where: { storeId: store.id, title },
      });
      if (!product) {
        console.log(`  ⚠️  Товар не найден: "${title}"`);
        continue;
      }
      await prisma.product.update({
        where: { id: product.id },
        data: { images },
      });
      updatedProducts++;
    }

    console.log(`✅ ${slug} — обложка, аватар, ${updatedProducts} товаров`);
  }

  console.log("\n🎉 Изображения обновлены!");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
