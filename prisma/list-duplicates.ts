import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const prods = await p.product.findMany({
    select: {
      id: true,
      title: true,
      images: true,
      store: { select: { name: true, slug: true } },
    },
    orderBy: { storeId: 'asc' },
  });

  const imgCounts = new Map<string, Array<{ store: string; title: string }>>();

  for (const pr of prods) {
    const img = pr.images[0] || 'EMPTY';
    if (!imgCounts.has(img)) imgCounts.set(img, []);
    imgCounts.get(img)!.push({ store: pr.store?.name || '', title: pr.title });
  }

  console.log('=== ДУБЛИРУЮЩИЕСЯ ФОТОГРАФИИ ===');
  let dupCount = 0;
  for (const [img, list] of imgCounts.entries()) {
    if (list.length > 1) {
      dupCount++;
      const short = img.split('?')[0].replace('https://images.unsplash.com/photo-', '');
      console.log(`\n[${list.length}x] ${short}`);
      for (const item of list) {
        console.log(`   - [${item.store}] ${item.title}`);
      }
    }
  }

  console.log(`\nВсего повторяющихся изображений: ${dupCount}`);
  await p.$disconnect();
}

run().catch(console.error);
