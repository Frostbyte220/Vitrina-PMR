import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const u = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const UPDATES: Array<{ storePattern: string; titlePattern: string; images: string[] }> = [
  // 1. Vintage Corner PMR
  {
    storePattern: 'vintage',
    titlePattern: 'свитшот',
    images: [u('1556905055-8f358a7a47b2')],
  },
  {
    storePattern: 'vintage',
    titlePattern: 'Ремень',
    images: [u('1624222247344-550fb60583dc')],
  },
  {
    storePattern: 'vintage',
    titlePattern: 'Рубашка',
    images: [u('1596755094514-f87e34085b2c')],
  },
  {
    storePattern: 'vintage',
    titlePattern: 'Coach',
    images: [u('1590874103328-eac38a683ce7')],
  },

  // 2. SneakerHub PMR
  {
    storePattern: 'sneaker',
    titlePattern: 'Adidas Ultraboost',
    images: [u('1587563871167-1ee9c731aefb')],
  },
  {
    storePattern: 'sneaker',
    titlePattern: 'New Balance',
    images: [u('1539185441755-769473a23570')],
  },
  {
    storePattern: 'sneaker',
    titlePattern: 'Puma RS-X',
    images: [u('1515955656352-a1fa3ffcd111')],
  },
  {
    storePattern: 'sneaker',
    titlePattern: 'Носки',
    images: [u('1586350977771-b3b0abd50c82')],
  },

  // 3. Kids Joy PMR
  {
    storePattern: 'kids',
    titlePattern: 'Балерина',
    images: [u('1518831959646-742c3a14ebf7')],
  },

  // 4. Bags Boutique PMR
  {
    storePattern: 'bags',
    titlePattern: 'Кошелёк',
    images: [u('1627123424574-724758594e93')],
  },
  {
    storePattern: 'bags',
    titlePattern: 'Fanny Pack',
    images: [u('1547949003-9792a18a2601')],
  },
  {
    storePattern: 'bags',
    titlePattern: 'Crossbody',
    images: [u('1566150905458-1bf1fc113f0d')],
  },

  // 5. SportLife PMR
  {
    storePattern: 'sport',
    titlePattern: 'Шорты',
    images: [u('1591195853828-11db59a44f6b')],
  },
  {
    storePattern: 'sport',
    titlePattern: 'Fleece',
    images: [u('1515886657613-9f3515b0c78f')],
  },

  // 6. Beauty Box Tiraspol
  {
    storePattern: 'beauty_box',
    titlePattern: 'Toleriane',
    images: [u('1556228720-195a672e8a03')],
  },
  {
    storePattern: 'beauty_box',
    titlePattern: 'Telescopic',
    images: [u('1522337360788-8b13dee7a37e')],
  },
  {
    storePattern: 'beauty_box',
    titlePattern: 'NYX',
    images: [u('1527799820374-dcf8d9d4a388')],
  },

  // 7. Модный Шкаф
  {
    storePattern: 'шкаф',
    titlePattern: 'двубортный',
    images: [u('1544441893-675973e31985')],
  },

  // 8. BeautiBox
  {
    storePattern: 'beautibox',
    titlePattern: 'патчи',
    images: [u('1570172619644-dfd03ed5d881')],
  },
];

async function run() {
  console.log('🔄 Устранение всех повторов изображений...\n');

  for (const item of UPDATES) {
    const store = await p.store.findFirst({
      where: {
        OR: [
          { slug: { contains: item.storePattern, mode: 'insensitive' } },
          { name: { contains: item.storePattern, mode: 'insensitive' } },
        ],
      },
    });

    if (!store) {
      console.log(`⚠️ Магазин не найден: ${item.storePattern}`);
      continue;
    }

    const prod = await p.product.findFirst({
      where: {
        storeId: store.id,
        title: { contains: item.titlePattern, mode: 'insensitive' },
      },
    });

    if (!prod) {
      console.log(`⚠️ Товар не найден: [${store.name}] -> "${item.titlePattern}"`);
      continue;
    }

    await p.product.update({
      where: { id: prod.id },
      data: { images: item.images },
    });

    console.log(`✅ [${store.name}] "${prod.title}" -> новое уникальное фото`);
  }

  console.log('\n🎉 Все повторы устранены!');
  await p.$disconnect();
}

run().catch(console.error);
