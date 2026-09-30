import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all products...');
  await prisma.product.deleteMany({});
  
  console.log('Deleting all stores...');
  await prisma.store.deleteMany({});
  
  console.log('Successfully deleted all products and stores!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
