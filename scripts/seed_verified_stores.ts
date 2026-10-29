import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting verification and adding products...");

  // 1. Устанавливаем статус isVerified = true для 4 магазинов
  const verifiedStoreIds = [
    "cmuucltax000179pot02f2w6r", // Сникерхэд ПМР
    "cmuswtb170001so5fiyecnkzo", // Мир электроники
    "cmuuclwa5000579pol3osunqv", // BeautiBox
    "cmuuclut7000379po6fsqe0s1", // Модный Шкаф
  ];

  for (const id of verifiedStoreIds) {
    const updated = await prisma.store.update({
      where: { id },
      data: { isVerified: true },
      select: { id: true, name: true, slug: true, isVerified: true },
    });
    console.log(`✅ Магазин «${updated.name}» (${updated.slug}) верифицирован: isVerified=${updated.isVerified}`);
  }

  // 2. Добавляем товары для «Сникерхэд ПМР»
  const sneakersStoreId = "cmuucltax000179pot02f2w6r";
  const sneakersUserId = "9afdbb9d-836d-4174-af77-1a0247e9bd5f";

  const sneakersProducts = [
    {
      title: "Кроссовки Nike Air Jordan 1 Retro High",
      price: 1450,
      oldPrice: 1750,
      category: "Обувь",
      subCategory: "Кроссовки",
      sizes: ["40", "41", "42", "43", "44"],
      images: [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
      ],
      description: "Легендарные баскетбольные кроссовки в классической расцветке. Премиальная кожа, амортизация Air-Sole, максимальный комфорт на каждый день.",
    },
    {
      title: "Кроссовки New Balance 530 White Silver",
      price: 980,
      oldPrice: 1200,
      category: "Обувь",
      subCategory: "Кроссовки",
      sizes: ["39", "40", "41", "42", "43"],
      images: [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
      ],
      description: "Трендовые ретро-раннеры в белом цвете с серебристыми вставками. Дышащая сетка ABZORB, невесомая подошва.",
    },
    {
      title: "Кроссовки Adidas Samba OG Classic",
      price: 1100,
      oldPrice: null,
      category: "Обувь",
      subCategory: "Кроссовки",
      sizes: ["41", "42", "43", "44", "45"],
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80",
      ],
      description: "Культовая классика уличного стиля. Верх из мягкой кожи с замшевым Т-образным носком и контрастными полосками.",
    },
    {
      title: "Кроссовки Puma RS-X Reinvention",
      price: 890,
      oldPrice: 1050,
      category: "Обувь",
      subCategory: "Кроссовки",
      sizes: ["40", "41", "42", "43"],
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      ],
      description: "Массивный силуэт в стиле 80-х с ультрасовременной полиуретановой межподошвой Running System.",
    },
  ];

  for (const p of sneakersProducts) {
    const created = await prisma.product.create({
      data: {
        ...p,
        status: "Активен",
        userId: sneakersUserId,
        storeId: sneakersStoreId,
      },
    });
    console.log(`👟 Создан товар: ${created.title} (${created.price} Руб)`);
  }

  // 3. Добавляем товары для «Мир электроники»
  const electronicsStoreId = "cmuswtb170001so5fiyecnkzo";
  const electronicsUserId = "d34ac5be-479b-42f5-82f6-0f7625daf281";

  const electronicsProducts = [
    {
      title: "Беспроводные наушники Sony WH-1000XM5",
      price: 4200,
      oldPrice: 4800,
      category: "Электроника",
      subCategory: "Аудио",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
      ],
      description: "Флагманские полноразмерные наушники с лучшим на рынке активным шумоподавлением (ANC), 30 часов автономности и Hi-Res Audio.",
    },
    {
      title: "Умная колонка Яндекс Станция Миди",
      price: 1650,
      oldPrice: 1890,
      category: "Электроника",
      subCategory: "Умный дом",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80",
      ],
      description: "Мощный звук 24 Вт в компактном корпусе с голосовым помощником Алиса и встроенным хабом управления умным домом Zigbee.",
    },
    {
      title: "Портативная колонка JBL Charge 5 Black",
      price: 1950,
      oldPrice: 2200,
      category: "Электроника",
      subCategory: "Аудио",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
      ],
      description: "Влагозащищенная акустика IP67 с глубоким басом JBL Pro Sound, функцией пауэрбанка и 20 часами работы без подзарядки.",
    },
    {
      title: "Беспроводная зарядная станция 3-в-1 MagSafe",
      price: 450,
      oldPrice: 550,
      category: "Электроника",
      subCategory: "Аксессуары",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&q=80",
      ],
      description: "Элегантная складная станция для одновременной быстрой зарядки смартфона, смарт-часов и беспроводных наушников.",
    },
  ];

  for (const p of electronicsProducts) {
    const created = await prisma.product.create({
      data: {
        ...p,
        status: "Активен",
        userId: electronicsUserId,
        storeId: electronicsStoreId,
      },
    });
    console.log(`⚡ Создан товар: ${created.title} (${created.price} Руб)`);
  }

  // 4. Добавляем товары для «BeautiBox»
  const beautyStoreId = "cmuuclwa5000579pol3osunqv";
  const beautyUserId = "527a3c9f-9768-4645-b9ed-57a027451192";

  const beautyProducts = [
    {
      title: "Набор сывороток The Ordinary Niacinamide + Zinc",
      price: 290,
      oldPrice: 350,
      category: "Косметика",
      subCategory: "Уход за кожей",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
      ],
      description: "Высокоактивная формула с 10% ниацинамидом и 1% цинком для сужения пор, выравнивания тона кожи и борьбы с несовершенствами.",
    },
    {
      title: "Парфюмерная вода Baccarat Rouge 540",
      price: 1850,
      oldPrice: 2200,
      category: "Парфюмерия",
      subCategory: "Нишевая парфюмерия",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80",
      ],
      description: "Культовый восточно-цветочный аромат с нотами жасмина, шафрана, амбры и белого кедра. Невероятный шлейф и стойкость более 24 часов.",
    },
    {
      title: "Гидрогелевые патчи для глаз с золотом и муцином",
      price: 180,
      oldPrice: null,
      category: "Косметика",
      subCategory: "Уход за лицом",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
      ],
      description: "Мгновенно снимают отечность, осветляют темные круги под глазами и разглаживают мелкие мимические морщинки. В банке 60 шт.",
    },
    {
      title: "Солнцезащитный крем SPF 50+ Round Lab Birch Juice",
      price: 340,
      oldPrice: 390,
      category: "Косметика",
      subCategory: "Защита от солнца",
      sizes: [],
      images: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
      ],
      description: "Хит корейского ухода. Легкая текстура без липкости и белых следов, на основе березового сока и гиалуроновой кислоты.",
    },
  ];

  for (const p of beautyProducts) {
    const created = await prisma.product.create({
      data: {
        ...p,
        status: "Активен",
        userId: beautyUserId,
        storeId: beautyStoreId,
      },
    });
    console.log(`💄 Создан товар: ${created.title} (${created.price} Руб)`);
  }

  // 5. Добавляем товары для «Модный Шкаф»
  const fashionStoreId = "cmuuclut7000379po6fsqe0s1";
  const fashionUserId = "3e3e318b-ea87-4204-bd8d-68470c9b0da1";

  const fashionProducts = [
    {
      title: "Оверсайз худи из плотного футера с начесом",
      price: 580,
      oldPrice: 720,
      category: "Одежда",
      subCategory: "Толстовки и свитшоты",
      sizes: ["S", "M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
      ],
      description: "Уютный базовый худи графитового цвета. Плотный 100% хлопок премиум качества пенье 380 г/м², держит форму после стирок.",
    },
    {
      title: "Джинсы прямого кроя Wide-Leg Vintage Wash",
      price: 650,
      oldPrice: 790,
      category: "Одежда",
      subCategory: "Джинсы",
      sizes: ["28", "30", "32", "34"],
      images: [
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
      ],
      description: "Классический прямой силуэт с высокой посадкой в винтажной варке. Плотный деним 100% хлопок.",
    },
    {
      title: "Вязаный свитер крупной вязки с косами",
      price: 490,
      oldPrice: null,
      category: "Одежда",
      subCategory: "Свитеры и джемперы",
      sizes: ["ONE SIZE"],
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
      ],
      description: "Мягкий и теплый свитер молочного цвета с добавлением шерсти альпака. Идеально сочетается с брюками и юбками.",
    },
    {
      title: "Тренч классический двубортный песочный",
      price: 1250,
      oldPrice: 1490,
      category: "Одежда",
      subCategory: "Верхняя одежда",
      sizes: ["S", "M", "L"],
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
      ],
      description: "Элегантный длинный тренч с поясом и ветрозащитной планкой. Водоотталкивающая плотная ткань, премиальная фурнитура.",
    },
  ];

  for (const p of fashionProducts) {
    const created = await prisma.product.create({
      data: {
        ...p,
        status: "Активен",
        userId: fashionUserId,
        storeId: fashionStoreId,
      },
    });
    console.log(`👗 Создан товар: ${created.title} (${created.price} Руб)`);
  }

  console.log("🎉 Все верифицированные магазины и товары успешно обновлены!");
}

main().catch(console.error);
