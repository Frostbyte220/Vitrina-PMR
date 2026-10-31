import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

async function run() {
  console.log('🎯 Точечное устранение последних 3 дубликатов...\n');

  // 1. SneakerHub PMR (slug: 'sneakerhub_pmr')
  const sneakerStore = await p.store.findUnique({ where: { slug: 'sneakerhub_pmr' } });
  if (sneakerStore) {
    await p.product.updateMany({
      where: { storeId: sneakerStore.id, title: { contains: 'Adidas Ultraboost' } },
      data: { images: [u('1587563871167-1ee9c731aefb')] },
    });
    console.log('👟 SneakerHub -> Adidas Ultraboost 22');

    await p.product.updateMany({
      where: { storeId: sneakerStore.id, title: { contains: 'New Balance' } },
      data: { images: [u('1539185441755-769473a23570')] },
    });
    console.log('👟 SneakerHub -> New Balance 574 Grey');

    await p.product.updateMany({
      where: { storeId: sneakerStore.id, title: { contains: 'Puma' } },
      data: { images: [u('1515955656352-a1fa3ffcd111')] },
    });
    console.log('👟 SneakerHub -> Puma RS-X Bold');

    await p.product.updateMany({
      where: { storeId: sneakerStore.id, title: { contains: 'Носки' } },
      data: { images: [u('1586350977771-b3b0abd50c82')] },
    });
    console.log('🧦 SneakerHub -> Носки Nike');
  }

  // 2. Elegance Tiraspol — Пальто «Camel Wool»
  const eleganceStore = await p.store.findUnique({ where: { slug: 'elegance_tiraspol' } });
  if (eleganceStore) {
    await p.product.updateMany({
      where: { storeId: eleganceStore.id, title: { contains: 'Пальто' } },
      data: { images: [u('1508427953056-b00b8d78ebf5')] },
    });
    console.log('🧥 Elegance -> Пальто Camel Wool');
  }

  // 3. Vintage Corner PMR — Сумка Coach
  const vintageStore = await p.store.findUnique({ where: { slug: 'vintage_pmr' } });
  if (vintageStore) {
    await p.product.updateMany({
      where: { storeId: vintageStore.id, title: { contains: 'Coach' } },
      data: { images: [u('1598532163257-ae3c6b2524b6')] },
    });
    console.log('👜 Vintage -> Сумка Coach');
  }

  console.log('\n🎉 Все дубликаты устранены!');
  await p.$disconnect();
}

run().catch(console.error);
