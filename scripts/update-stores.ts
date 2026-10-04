import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const storeUpdates = [
  {
    slug: 'sneakers_pmr',
    avatarUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop&q=80', // Яркий кроссовок
    coverUrl: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=1600&h=400&fit=crop&q=80', // Стена кроссовок
  },
  {
    slug: 'modny_shkaf',
    avatarUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&q=80', // Эстетичная вешалка
    coverUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=400&fit=crop&q=80', // Интерьер стильного бутика
  },
  {
    slug: 'beautibox',
    avatarUrl: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&h=400&fit=crop&q=80', // Косметика/текстура
    coverUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1600&h=400&fit=crop&q=80', // Эстетичная раскладка косметики
  }
];

async function main() {
  console.log('Updating store images...');
  
  for (const update of storeUpdates) {
    await prisma.store.update({
      where: { slug: update.slug },
      data: {
        avatarUrl: update.avatarUrl,
        coverUrl: update.coverUrl
      }
    });
    
    // Также обновляем аватар в модели User, чтобы он совпадал
    const store = await prisma.store.findUnique({ where: { slug: update.slug } });
    if (store) {
      await prisma.user.update({
        where: { id: store.userId },
        data: { avatar: update.avatarUrl }
      });
    }

    console.log(`Updated images for store: ${update.slug}`);
  }
  
  console.log('Update finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
