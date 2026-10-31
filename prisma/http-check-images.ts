import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  const products = await p.product.findMany({
    select: {
      id: true,
      title: true,
      images: true,
      store: { select: { slug: true, name: true } },
    },
  });

  console.log(`Checking ${products.length} products...`);
  const broken: Array<{ store: string; title: string; url: string; status: number }> = [];

  for (const pr of products) {
    if (!pr.images || pr.images.length === 0) {
      broken.push({ store: pr.store?.name || '', title: pr.title, url: 'NONE', status: 0 });
      continue;
    }
    const url = pr.images[0];
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status !== 200) {
        broken.push({ store: pr.store?.name || '', title: pr.title, url, status: res.status });
      }
    } catch (e: any) {
      broken.push({ store: pr.store?.name || '', title: pr.title, url, status: -1 });
    }
  }

  console.log('\n--- BROKEN PRODUCTS ---');
  for (const b of broken) {
    console.log(`[${b.status}] ${b.store} -> "${b.title}" (${b.url})`);
  }

  const stores = await p.store.findMany({
    select: { name: true, slug: true, avatarUrl: true, coverUrl: true },
  });
  console.log('\n--- CHECKING STORES ---');
  for (const s of stores) {
    if (s.avatarUrl) {
      try {
        const res = await fetch(s.avatarUrl, { method: 'HEAD' });
        if (res.status !== 200) console.log(`[AVATAR ${res.status}] ${s.name}: ${s.avatarUrl}`);
      } catch (e) {
        console.log(`[AVATAR ERR] ${s.name}: ${s.avatarUrl}`);
      }
    }
    if (s.coverUrl) {
      try {
        const res = await fetch(s.coverUrl, { method: 'HEAD' });
        if (res.status !== 200) console.log(`[COVER ${res.status}] ${s.name}: ${s.coverUrl}`);
      } catch (e) {
        console.log(`[COVER ERR] ${s.name}: ${s.coverUrl}`);
      }
    }
  }

  await p.$disconnect();
}

run().catch(console.error);
