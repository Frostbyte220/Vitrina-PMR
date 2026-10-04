import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stores = [
  {
    user: {
      name: 'Сникерхэд ПМР',
      email: 'sneakers@vitrina.pmr',
      instagram: '@sneakers_pmr',
    },
    store: {
      name: 'Сникерхэд ПМР',
      slug: 'sneakers_pmr',
      description: 'Оригинальная обувь для мужчин и женщин. Доставка по всему Приднестровью!',
      instagram: 'sneakers_pmr',
      cities: ['Тирасполь', 'Бендеры'],
    },
    products: [
      {
        title: 'Кроссовки Nike Air Max',
        price: 1250,
        category: 'Обувь',
        subCategory: 'Для мужчин',
        description: 'Отличные беговые кроссовки. Размеры 41-45.',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
      },
      {
        title: 'Женские кеды Converse',
        price: 850,
        category: 'Обувь',
        subCategory: 'Для женщин',
        description: 'Классические белые кеды Converse Chuck Taylor.',
        images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'],
      },
      {
        title: 'Детские кроссовки Adidas',
        price: 600,
        category: 'Обувь',
        subCategory: 'Для детей',
        description: 'Удобная обувь для активных детей.',
        images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80'],
      }
    ]
  },
  {
    user: {
      name: 'Модный Шкаф',
      email: 'fashion@vitrina.pmr',
      instagram: '@modny_shkaf',
    },
    store: {
      name: 'Модный Шкаф',
      slug: 'modny_shkaf',
      description: 'Трендовая женская одежда из Европы. Обновление каждую неделю.',
      instagram: 'modny_shkaf',
      cities: ['Тирасполь', 'Рыбница'],
    },
    products: [
      {
        title: 'Летнее платье с цветочным принтом',
        price: 450,
        category: 'Одежда',
        subCategory: 'Для женщин',
        description: 'Легкое летнее платье из дышащего материала.',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
      },
      {
        title: 'Классический тренч',
        price: 1100,
        category: 'Одежда',
        subCategory: 'Для женщин',
        description: 'Бежевый тренч для осенней погоды.',
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
      },
      {
        title: 'Свитер оверсайз',
        price: 550,
        category: 'Одежда',
        subCategory: 'Для женщин',
        description: 'Мягкий и теплый вязаный свитер.',
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80'],
      }
    ]
  },
  {
    user: {
      name: 'BeautiBox',
      email: 'beauty@vitrina.pmr',
      instagram: '@beautibox_pmr',
    },
    store: {
      name: 'BeautiBox',
      slug: 'beautibox',
      description: 'Уходовая и декоративная косметика, парфюмерия мировых брендов.',
      instagram: 'beautibox_pmr',
      cities: ['Бендеры', 'Дубоссары'],
    },
    products: [
      {
        title: 'Увлажняющий крем для лица',
        price: 320,
        category: 'Косметика',
        subCategory: 'Для женщин',
        description: 'Глубоко увлажняющий крем на каждый день.',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'],
      },
      {
        title: 'Парфюмерная вода мужская',
        price: 890,
        category: 'Парфюмерия',
        subCategory: 'Для мужчин',
        description: 'Свежий древесный аромат для мужчин.',
        images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80'],
      },
      {
        title: 'Матовая помада',
        price: 150,
        category: 'Косметика',
        subCategory: 'Для женщин',
        description: 'Стойкая матовая помада, оттенок Nude.',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80'],
      },
      {
        title: 'Унисекс парфюм Niche',
        price: 1500,
        category: 'Парфюмерия',
        subCategory: 'Унисекс',
        description: 'Эксклюзивная нишевая парфюмерия.',
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80'],
      }
    ]
  }
];

async function main() {
  console.log('Start seeding...');
  
  for (const storeData of stores) {
    console.log(`Creating user and store for: ${storeData.user.name}`);
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
        where: { email: storeData.user.email }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: storeData.user.name,
                email: storeData.user.email,
                instagram: storeData.user.instagram,
            }
        });
    }

    // Check if store already exists
    let store = await prisma.store.findUnique({
        where: { userId: user.id }
    });

    if (!store) {
        store = await prisma.store.create({
            data: {
                ...storeData.store,
                userId: user.id
            }
        });
    }

    // Create products
    let createdCount = 0;
    for (const prodData of storeData.products) {
      await prisma.product.create({
        data: {
          ...prodData,
          userId: user.id,
          storeId: store.id
        }
      });
      createdCount++;
    }
    
    console.log(`Added ${createdCount} products for ${storeData.user.name}`);
  }
  
  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
