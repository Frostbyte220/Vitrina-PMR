import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const products = await p.product.findMany({
    select: {
      id: true,
      title: true,
      images: true,
      store: { select: { name: true, slug: true } },
    },
  });

  console.log(`Total products: ${products.length}`);
  let missing = 0;
  for (const pr of products) {
    if (!pr.images || pr.images.length === 0) {
      console.log(`[NO IMAGES] ${pr.store?.name} -> "${pr.title}"`);
      missing++;
    } else {
      const firstImg = pr.images[0];
      if (firstImg.includes('picsum')) {
        console.log(`[PICSUM] ${pr.store?.name} -> "${pr.title}" (${firstImg})`);
        missing++;
      }
    }
  }

  const stores = await p.store.findMany({
    select: { name: true, slug: true, avatarUrl: true, coverUrl: true },
  });
  console.log(`\nTotal stores: ${stores.length}`);
  for (const s of stores) {
    const isAvPicsum = s.avatarUrl?.includes('picsum');
    const isCvPicsum = s.coverUrl?.includes('picsum');
    if (!s.avatarUrl || isAvPicsum || !s.coverUrl || isCvPicsum) {
      console.log(`[STORE ISSUE] ${s.name}: avatar=${s.avatarUrl}, cover=${s.coverUrl}`);
    }
  }

  console.log(`\nDone. Products needing attention: ${missing}`);
  await p.$disconnect();
}
run().catch(console.error);
