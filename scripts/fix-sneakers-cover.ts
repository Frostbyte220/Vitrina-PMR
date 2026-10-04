import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Более надежная картинка со стеной кроссовок, которая точно есть на Unsplash
  const newCoverUrl = 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1600&h=400&fit=crop&q=80';
  
  await prisma.store.update({
    where: { slug: 'sneakers_pmr' },
    data: { coverUrl: newCoverUrl }
  });

  console.log('Sneakers_pmr cover updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
