import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  // Electronics cover (tech desk / devices)
  const electronicsCover =
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop&q=80';
  // Admin store cover & avatar
  const adminCover =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&q=80';
  const adminAvatar =
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop&q=80';

  await p.store.updateMany({
    where: { name: { contains: 'электроник', mode: 'insensitive' }, coverUrl: null },
    data: { coverUrl: electronicsCover },
  });

  await p.store.updateMany({
    where: { name: { contains: 'Admin', mode: 'insensitive' } },
    data: { coverUrl: adminCover, avatarUrl: adminAvatar },
  });

  console.log('Stores covers updated successfully!');
  await p.$disconnect();
}

run().catch(console.error);
