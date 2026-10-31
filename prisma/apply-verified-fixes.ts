import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

async function run() {
  console.log('🚀 Applying verified image fixes (100% HTTP 200)...\n');

  // 1. Jewelry Tiraspol — правильные украшения (кольца, серьги, цепочки, браслеты)
  const jewelryProducts: Record<string, string[]> = {
    'Кольцо серебро 925 «Волна»': [u('1605100804763-247f67b3557e')],
    'Серьги позолота «Tiny Stars»': [u('1635767798638-3e25273a8236')],
    'Цепочка «Herringbone» золото': [u('1515562141207-7a88fb7ce338')],
    'Браслет «Pearl» жемчуг': [u('1599643478518-a784e5dc4c8f')],
    'Подвеска «Moon» серебро 925': [u('1603561591411-07134e71a2a9')],
    'Набор украшений «Gift Set»': [u('1611591437281-460bfbe1220a')],
  };

  const jewelryStore = await p.store.findUnique({ where: { slug: 'jewelry_tiraspol' } });
  if (jewelryStore) {
    await p.store.update({
      where: { slug: 'jewelry_tiraspol' },
      data: {
        avatarUrl: u('1605100804763-247f67b3557e', 200, 200),
        coverUrl: u('1515562141207-7a88fb7ce338', 1200, 400),
      },
    });
    for (const [title, images] of Object.entries(jewelryProducts)) {
      await p.product.updateMany({
        where: { storeId: jewelryStore.id, title },
        data: { images },
      });
      console.log(`💎 Jewelry -> "${title}"`);
    }
  }

  // 2. Beauty Box — Dior Sauvage
  const beautyStore = await p.store.findUnique({ where: { slug: 'beauty_box_tiraspol' } });
  if (beautyStore) {
    await p.product.updateMany({
      where: { storeId: beautyStore.id, title: { contains: 'Dior Sauvage' } },
      data: { images: [u('1523293182086-7651a899d37f'), u('1592945403244-b3fbafd7f539')] },
    });
    console.log('💄 Beauty -> "Парфюм Dior Sauvage"');
  }

  // 3. Kids Joy PMR — кроссовки, школьник, пуховик, обложка
  const kidsStore = await p.store.findUnique({ where: { slug: 'kids_joy_pmr' } });
  if (kidsStore) {
    await p.store.update({
      where: { slug: 'kids_joy_pmr' },
      data: {
        coverUrl: u('1502086223501-7ea6ecd79368', 1200, 400),
      },
    });
    await p.product.updateMany({
      where: { storeId: kidsStore.id, title: { contains: 'Динозаврик' } },
      data: { images: [u('1595341888016-a392ef81b7de')] },
    });
    await p.product.updateMany({
      where: { storeId: kidsStore.id, title: { contains: 'Школьник' } },
      data: { images: [u('1514090458221-65bb69cf63e6')] },
    });
    await p.product.updateMany({
      where: { storeId: kidsStore.id, title: { contains: 'Пуховик' } },
      data: { images: [u('1519238263530-99bdd11df2ea')] },
    });
    console.log('👶 Kids Joy -> обложка и товары');
  }

  // 4. Elegance Tiraspol — юбка и пальто
  const eleganceStore = await p.store.findUnique({ where: { slug: 'elegance_tiraspol' } });
  if (eleganceStore) {
    await p.product.updateMany({
      where: { storeId: eleganceStore.id, title: { contains: 'Юбка плиссе' } },
      data: { images: [u('1583496661160-fb5886a0aaaa')] },
    });
    await p.product.updateMany({
      where: { storeId: eleganceStore.id, title: { contains: 'Пальто' } },
      data: { images: [u('1544441893-675973e31985')] },
    });
    console.log('👗 Elegance -> юбка и пальто');
  }

  // 5. SportLife PMR — Asics Gel-Nimbus 25
  const sportStore = await p.store.findUnique({ where: { slug: 'sportlife_pmr' } });
  if (sportStore) {
    await p.product.updateMany({
      where: { storeId: sportStore.id, title: { contains: 'Asics Gel-Nimbus' } },
      data: { images: [u('1584735935682-2f2b69dff9d2')] },
    });
    console.log('👟 SportLife -> Asics Gel-Nimbus');
  }

  console.log('\n✨ Все исправления применены!');
  await p.$disconnect();
}

run().catch(console.error);
