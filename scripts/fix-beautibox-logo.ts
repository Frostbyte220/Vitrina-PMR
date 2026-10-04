import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newAvatarUrl = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&q=80'; // Другая картинка с косметикой
  
  const store = await prisma.store.update({
    where: { slug: 'beautibox' },
    data: { avatarUrl: newAvatarUrl }
  });

  await prisma.user.update({
    where: { id: store.userId },
    data: { avatar: newAvatarUrl }
  });

  console.log('BeautiBox logo updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
