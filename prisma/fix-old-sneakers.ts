import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&q=80`;

async function run() {
  const oldStore = await p.store.findFirst({ where: { name: 'Сникерхэд ПМР' } });
  if (oldStore) {
    await p.product.updateMany({
      where: { storeId: oldStore.id, title: { contains: 'New Balance' } },
      data: { images: [u('1552346154-21d32810aba3')] },
    });
    await p.product.updateMany({
      where: { storeId: oldStore.id, title: { contains: 'Puma' } },
      data: { images: [u('1525966222134-fcfa99b8ae77')] },
    });
    console.log('Fixed old sneaker store duplicates');
  }
  await p.$disconnect();
}
run();
