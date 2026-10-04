import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing missing storeIds on products...');
  
  // Find all products where storeId is null
  const productsToFix = await prisma.product.findMany({
    where: { storeId: null, userId: { not: null } },
    include: { user: { include: { store: true } } }
  });

  console.log(`Found ${productsToFix.length} products with missing storeId.`);

  let fixedCount = 0;
  for (const product of productsToFix) {
    if (product.user?.store?.id) {
      await prisma.product.update({
        where: { id: product.id },
        data: { storeId: product.user.store.id }
      });
      fixedCount++;
    }
  }

  console.log(`Successfully fixed ${fixedCount} products!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
