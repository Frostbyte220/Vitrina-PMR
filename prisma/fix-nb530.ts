import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`.replace('${w}', '600').replace('${h}', '600');

async function run() {
  const oldStore = await p.store.findFirst({ where: { name: 'Сникерхэд ПМР' } });
  if (oldStore) {
    await p.product.updateMany({
      where: { storeId: oldStore.id, title: { contains: '530' } },
      data: { images: ['https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&h=600&fit=crop&q=80'] },
    });
    console.log('Fixed NB 530 with unique silver shoe photo');
  }
  await p.$disconnect();
}
run();
