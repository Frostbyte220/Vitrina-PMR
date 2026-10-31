/**
 * Seed script: 8 магазинов, 8–10 товаров каждый
 * Запуск: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const pic = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const stores = [
  // ── 1 SneakerHub PMR ──
  {
    instagram: "sneakerhub_pmr",
    name: "SneakerHub PMR",
    slug: "sneakerhub_pmr",
    description: "Кроссовки и спортивная обувь в Тирасполе. Nike, Adidas, New Balance — оригиналы и реплики. Доставка по ПМР.",
    phone: "+373 777 11 22",
    telegram: "sneakerhub_pmr",
    viber: null,
    cities: ["Тирасполь", "Бендеры"],
    isVerified: true,
    avatarUrl: pic("sneaker-logo", 200, 200),
    coverUrl: pic("sneaker-cover", 1200, 400),
    products: [
      {
        title: "Nike Air Force 1 White",
        price: 1490, oldPrice: 1890,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("nike-af1-a"), pic("nike-af1-b"), pic("nike-af1-c")],
        description: "Культовые белые кроссовки Nike Air Force 1. Натуральная кожа, подошва Air. Размеры 36–46.",
        sizes: ["36","37","38","39","40","41","42","43","44","45","46"],
        availability: "В наличии", viewsCount: 214, contactClicksCount: 18,
      },
      {
        title: "Adidas Ultraboost 22",
        price: 1750, oldPrice: null,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("adidas-ultra-a"), pic("adidas-ultra-b")],
        description: "Беговые кроссовки Adidas Ultraboost 22. Технология BOOST — максимальный возврат энергии. Размеры 39–46.",
        sizes: ["39","40","41","42","43","44","45","46"],
        availability: "В наличии", viewsCount: 178, contactClicksCount: 12,
      },
      {
        title: "New Balance 574 Grey",
        price: 1290, oldPrice: 1590,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("nb574-a"), pic("nb574-b")],
        description: "Классические кроссовки New Balance 574. Замша + сетка. Удобные на каждый день.",
        sizes: ["38","39","40","41","42","43"],
        availability: "В наличии", viewsCount: 142, contactClicksCount: 9,
      },
      {
        title: "Nike Jordan 1 Retro High OG",
        price: 2290, oldPrice: null,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("jordan1-a"), pic("jordan1-b"), pic("jordan1-c")],
        description: "Легендарные Nike Air Jordan 1 Retro High OG. Красно-чёрная расцветка Chicago. Натуральная кожа.",
        sizes: ["40","41","42","43","44"],
        availability: "Под заказ", viewsCount: 398, contactClicksCount: 34,
      },
      {
        title: "Puma RS-X Bold",
        price: 990, oldPrice: 1290,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("puma-rsx-a"), pic("puma-rsx-b")],
        description: "Кроссовки Puma RS-X Bold с массивной подошвой. Яркий дизайн. Размеры 36–45.",
        sizes: ["36","37","38","39","40","41","42","43","44","45"],
        availability: "В наличии", viewsCount: 96, contactClicksCount: 7,
      },
      {
        title: "Носки Nike (набор 6 пар)",
        price: 290, oldPrice: null,
        category: "Аксессуары", subCategory: null,
        images: [pic("nike-socks-a")],
        description: "6 пар коротких белых носков Nike. Хлопок + эластан. Размер 36–46.",
        sizes: ["36-40","41-46"],
        availability: "В наличии", viewsCount: 67, contactClicksCount: 5,
      },
    ],
  },

  // ── 2 Elegance Tiraspol ──
  {
    instagram: "elegance_tiraspol",
    name: "Elegance Tiraspol",
    slug: "elegance_tiraspol",
    description: "Женская одежда и платья в Тирасполе. Нарядные и повседневные луки. Размеры XS–XL. Доставка по ПМР.",
    phone: "+373 777 33 44",
    telegram: "elegance_tiraspol",
    viber: "+37377733440",
    cities: ["Тирасполь"],
    isVerified: true,
    avatarUrl: pic("elegance-logo", 200, 200),
    coverUrl: pic("elegance-cover", 1200, 400),
    products: [
      {
        title: "Платье миди «Вечерняя роза»",
        price: 890, oldPrice: 1190,
        category: "Одежда", subCategory: "Платья",
        images: [pic("dress-rose-a"), pic("dress-rose-b"), pic("dress-rose-c")],
        description: "Элегантное платье миди из шифона нежно-розового цвета. Декольте с оборкой, расклешённая юбка.",
        sizes: ["XS","S","M","L"],
        availability: "В наличии", viewsCount: 321, contactClicksCount: 27,
      },
      {
        title: "Костюм деловой «Linen Beige»",
        price: 1290, oldPrice: null,
        category: "Одежда", subCategory: "Костюмы",
        images: [pic("suit-beige-a"), pic("suit-beige-b")],
        description: "Льняной деловой костюм: жакет + брюки. Цвет бежевый, приталенный силуэт.",
        sizes: ["S","M","L","XL"],
        availability: "В наличии", viewsCount: 189, contactClicksCount: 15,
      },
      {
        title: "Блуза «Silk Touch» белая",
        price: 490, oldPrice: 650,
        category: "Одежда", subCategory: "Блузы",
        images: [pic("blouse-white-a"), pic("blouse-white-b")],
        description: "Лёгкая блуза из атласной ткани. V-образный вырез, длинный рукав с манжетами.",
        sizes: ["XS","S","M","L","XL"],
        availability: "В наличии", viewsCount: 143, contactClicksCount: 11,
      },
      {
        title: "Юбка плиссе «Champagne»",
        price: 590, oldPrice: null,
        category: "Одежда", subCategory: "Юбки",
        images: [pic("skirt-plisse-a"), pic("skirt-plisse-b")],
        description: "Юбка-плиссе миди шампанского цвета. Высокая посадка, эластичный пояс.",
        sizes: ["XS","S","M","L","XL"],
        availability: "В наличии", viewsCount: 198, contactClicksCount: 16,
      },
      {
        title: "Пальто «Camel Wool» осеннее",
        price: 1890, oldPrice: 2490,
        category: "Одежда", subCategory: "Пальто",
        images: [pic("coat-camel-a"), pic("coat-camel-b"), pic("coat-camel-c")],
        description: "Пальто из шерстяного сукна кэмел-цвета. Пояс, карманы, воротник с лацканами.",
        sizes: ["S","M","L"],
        availability: "В наличии", viewsCount: 287, contactClicksCount: 22,
      },
      {
        title: "Джемпер ribbed «Dusty Rose»",
        price: 680, oldPrice: null,
        category: "Одежда", subCategory: "Свитера",
        images: [pic("sweater-rose-a"), pic("sweater-rose-b")],
        description: "Вязаный джемпер в рубчик пудрово-розового цвета. Удлинённый крой.",
        sizes: ["XS","S","M","L"],
        availability: "В наличии", viewsCount: 156, contactClicksCount: 13,
      },
      {
        title: "Брюки «Wide Leg» чёрные",
        price: 750, oldPrice: null,
        category: "Одежда", subCategory: "Брюки",
        images: [pic("pants-wide-a"), pic("pants-wide-b")],
        description: "Широкие брюки с высокой посадкой. Костюмная ткань. Цвет: чёрный.",
        sizes: ["XS","S","M","L","XL"],
        availability: "В наличии", viewsCount: 211, contactClicksCount: 19,
      },
    ],
  },

  // ── 3 Kids Joy PMR ──
  {
    instagram: "kids_joy_pmr",
    name: "Kids Joy PMR",
    slug: "kids_joy_pmr",
    description: "Детская одежда и обувь в Тирасполе и Бендерах. Новорождённые — подростки. Безопасные материалы.",
    phone: "+373 777 55 66",
    telegram: "kids_joy_pmr",
    viber: null,
    cities: ["Тирасполь","Бендеры","Дубоссары"],
    isVerified: false,
    avatarUrl: pic("kids-logo", 200, 200),
    coverUrl: pic("kids-cover", 1200, 400),
    products: [
      {
        title: "Комбинезон флисовый «Мишка» 62–74",
        price: 390, oldPrice: null,
        category: "Одежда", subCategory: "Детская одежда",
        images: [pic("kids-overalls-a"), pic("kids-overalls-b")],
        description: "Флисовый комбинезон с ушками мишки. Цвет: серый. Размеры 62, 68, 74.",
        sizes: ["62","68","74"],
        availability: "В наличии", viewsCount: 178, contactClicksCount: 14,
      },
      {
        title: "Кроссовки «Динозаврик» 20–25",
        price: 490, oldPrice: 590,
        category: "Обувь", subCategory: "Детская обувь",
        images: [pic("kids-sneakers-a"), pic("kids-sneakers-b")],
        description: "Яркие детские кроссовки с принтом динозавра. Лёгкие, дышащие. Размеры 20–25.",
        sizes: ["20","21","22","23","24","25"],
        availability: "В наличии", viewsCount: 134, contactClicksCount: 11,
      },
      {
        title: "Набор «Школьник» 7–9 лет",
        price: 890, oldPrice: null,
        category: "Одежда", subCategory: "Детская одежда",
        images: [pic("kids-school-a"), pic("kids-school-b")],
        description: "Школьный набор: брюки + рубашка + жилет. Серо-белая гамма. Размеры 7, 8 и 9 лет.",
        sizes: ["7 лет","8 лет","9 лет"],
        availability: "В наличии", viewsCount: 203, contactClicksCount: 17,
      },
      {
        title: "Платье «Балерина» для девочки",
        price: 490, oldPrice: null,
        category: "Одежда", subCategory: "Детская одежда",
        images: [pic("kids-dress-a"), pic("kids-dress-b")],
        description: "Нарядное платье-пачка для девочки. Цвет: розовый, с блёстками. Размеры 3–8 лет.",
        sizes: ["3 года","4 года","5 лет","6 лет","7 лет","8 лет"],
        availability: "В наличии", viewsCount: 245, contactClicksCount: 20,
      },
      {
        title: "Пуховик детский «Arctic» 92–116",
        price: 990, oldPrice: 1290,
        category: "Одежда", subCategory: "Детская одежда",
        images: [pic("kids-jacket-a"), pic("kids-jacket-b")],
        description: "Тёплый зимний пуховик. Двойная молния, флисовая подкладка. Цвет: синий.",
        sizes: ["92","98","104","110","116"],
        availability: "В наличии", viewsCount: 167, contactClicksCount: 15,
      },
    ],
  },

  // ── 4 Bags Boutique PMR ──
  {
    instagram: "bags_boutique_pmr",
    name: "Bags Boutique PMR",
    slug: "bags_boutique_pmr",
    description: "Сумки, рюкзаки и кошельки в Тирасполе. Каждую неделю новые поступления. Стиль без переплат.",
    phone: "+373 777 77 88",
    telegram: "bags_boutique_pmr",
    viber: "+37377777880",
    cities: ["Тирасполь"],
    isVerified: false,
    avatarUrl: pic("bags-logo", 200, 200),
    coverUrl: pic("bags-cover", 1200, 400),
    products: [
      {
        title: "Сумка тоут «Canvas Everyday»",
        price: 590, oldPrice: null,
        category: "Сумки", subCategory: "Шоперы",
        images: [pic("bag-tote-a"), pic("bag-tote-b"), pic("bag-tote-c")],
        description: "Вместительная парусиновая сумка-тоут. Внутренние карманы, молния. Цвет: бежевый.",
        sizes: [],
        availability: "В наличии", viewsCount: 187, contactClicksCount: 15,
      },
      {
        title: "Рюкзак кожаный «Urban»",
        price: 1190, oldPrice: 1490,
        category: "Сумки", subCategory: "Рюкзаки",
        images: [pic("backpack-a"), pic("backpack-b")],
        description: "Кожаный рюкзак из экокожи. Отделение для ноутбука 15\", карман для телефона, антивор-застёжка.",
        sizes: [],
        availability: "В наличии", viewsCount: 256, contactClicksCount: 21,
      },
      {
        title: "Клатч «Evening» серебро",
        price: 390, oldPrice: null,
        category: "Сумки", subCategory: "Клатчи",
        images: [pic("clutch-silver-a"), pic("clutch-silver-b")],
        description: "Вечерний клатч с серебряной фурнитурой. Жёсткий каркас, цепочка-ремень.",
        sizes: [],
        availability: "В наличии", viewsCount: 123, contactClicksCount: 9,
      },
      {
        title: "Поясная сумка «Fanny Pack»",
        price: 290, oldPrice: 390,
        category: "Сумки", subCategory: "Поясные сумки",
        images: [pic("beltbag-a"), pic("beltbag-b")],
        description: "Поясная сумка-бананка из нейлона. Несколько отделений, регулируемый ремень. Чёрный.",
        sizes: [],
        availability: "В наличии", viewsCount: 98, contactClicksCount: 8,
      },
      {
        title: "Кошелёк «Mini» розовый",
        price: 190, oldPrice: null,
        category: "Аксессуары", subCategory: null,
        images: [pic("wallet-pink-a")],
        description: "Маленький кошелёк из экокожи. Отделы для карт, монет и купюр. Нежно-розовый.",
        sizes: [],
        availability: "В наличии", viewsCount: 76, contactClicksCount: 6,
      },
      {
        title: "Сумка кросс-боди «Crossbody»",
        price: 690, oldPrice: null,
        category: "Сумки", subCategory: "Кросс-боди",
        images: [pic("crossbody-a"), pic("crossbody-b"), pic("crossbody-c")],
        description: "Компактная сумка кросс-боди из зернистой экокожи. Длинный ремень, магнитная застёжка.",
        sizes: [],
        availability: "В наличии", viewsCount: 201, contactClicksCount: 17,
      },
    ],
  },

  // ── 5 SportLife PMR ──
  {
    instagram: "sportlife_pmr",
    name: "SportLife PMR",
    slug: "sportlife_pmr",
    description: "Спортивная одежда и инвентарь в Тирасполе. Nike, Adidas, Under Armour — для тренировок и активного отдыха.",
    phone: "+373 777 99 00",
    telegram: "sportlife_pmr",
    viber: null,
    cities: ["Тирасполь","Рыбница"],
    isVerified: true,
    avatarUrl: pic("sport-logo", 200, 200),
    coverUrl: pic("sport-cover", 1200, 400),
    products: [
      {
        title: "Леггинсы Nike Pro 7/8",
        price: 790, oldPrice: 990,
        category: "Одежда", subCategory: "Спортивная одежда",
        images: [pic("leggings-a"), pic("leggings-b")],
        description: "Компрессионные леггинсы Nike Pro 7/8. Влагоотводящая ткань Dri-FIT, высокая посадка.",
        sizes: ["XS","S","M","L","XL"],
        availability: "В наличии", viewsCount: 312, contactClicksCount: 26,
      },
      {
        title: "Футболка Adidas Aeroready",
        price: 490, oldPrice: null,
        category: "Одежда", subCategory: "Спортивная одежда",
        images: [pic("tshirt-sport-a"), pic("tshirt-sport-b")],
        description: "Спортивная футболка Adidas AEROREADY. Впитывает влагу, быстро сохнет. Размеры XS–XXL.",
        sizes: ["XS","S","M","L","XL","XXL"],
        availability: "В наличии", viewsCount: 198, contactClicksCount: 16,
      },
      {
        title: "Шорты Under Armour",
        price: 590, oldPrice: null,
        category: "Одежда", subCategory: "Спортивная одежда",
        images: [pic("shorts-sport-a"), pic("shorts-sport-b")],
        description: "Спортивные шорты Under Armour. Лёгкие, дышащие, внутренний карман. Размеры S–XXL.",
        sizes: ["S","M","L","XL","XXL"],
        availability: "В наличии", viewsCount: 145, contactClicksCount: 12,
      },
      {
        title: "Кроссовки Asics Gel-Nimbus 25",
        price: 1990, oldPrice: 2490,
        category: "Обувь", subCategory: "Кроссовки",
        images: [pic("asics-a"), pic("asics-b"), pic("asics-c")],
        description: "Беговые кроссовки Asics Gel-Nimbus 25. Максимальная амортизация. Размеры 39–46.",
        sizes: ["39","40","41","42","43","44","45","46"],
        availability: "В наличии", viewsCount: 267, contactClicksCount: 23,
      },
      {
        title: "Костюм Nike Club Fleece",
        price: 1490, oldPrice: null,
        category: "Одежда", subCategory: "Спортивные костюмы",
        images: [pic("tracksuit-a"), pic("tracksuit-b")],
        description: "Тёплый флисовый костюм Nike Club Fleece: толстовка + брюки. Серый меланж.",
        sizes: ["XS","S","M","L","XL"],
        availability: "В наличии", viewsCount: 334, contactClicksCount: 28,
      },
      {
        title: "Коврик для йоги 6 мм",
        price: 490, oldPrice: 690,
        category: "Разное", subCategory: null,
        images: [pic("yogamat-a"), pic("yogamat-b")],
        description: "Нескользящий коврик для йоги и фитнеса. Толщина 6 мм, размер 183×61 см. Фиолетовый.",
        sizes: [],
        availability: "В наличии", viewsCount: 112, contactClicksCount: 9,
      },
    ],
  },

  // ── 6 Beauty Box Tiraspol ──
  {
    instagram: "beauty_box_tiraspol",
    name: "Beauty Box Tiraspol",
    slug: "beauty_box_tiraspol",
    description: "Косметика и уход в Тирасполе. Оригинальная парфюмерия, уходовые средства, профессиональная косметика.",
    phone: "+373 777 21 43",
    telegram: "beauty_box_tiraspol",
    viber: "+37377721430",
    cities: ["Тирасполь"],
    isVerified: true,
    avatarUrl: pic("beauty-logo", 200, 200),
    coverUrl: pic("beauty-cover", 1200, 400),
    products: [
      {
        title: "Парфюм Dior Sauvage EDP 100 мл",
        price: 2490, oldPrice: null,
        category: "Косметика", subCategory: "Парфюмерия",
        images: [pic("dior-a"), pic("dior-b")],
        description: "Мужской парфюм Dior Sauvage EDP 100 мл. Свежий аромат с нотами бергамота и амброксана. Оригинал.",
        sizes: [],
        availability: "В наличии", viewsCount: 445, contactClicksCount: 38,
      },
      {
        title: "Крем La Roche-Posay Toleriane",
        price: 890, oldPrice: 1190,
        category: "Косметика", subCategory: "Уход за лицом",
        images: [pic("laroche-a"), pic("laroche-b")],
        description: "Увлажняющий крем La Roche-Posay Toleriane для чувствительной кожи. 40 мл, SPF 15.",
        sizes: [],
        availability: "В наличии", viewsCount: 234, contactClicksCount: 19,
      },
      {
        title: "Палетка Anastasia Beverly Hills",
        price: 1290, oldPrice: null,
        category: "Косметика", subCategory: "Макияж",
        images: [pic("abh-a"), pic("abh-b"), pic("abh-c")],
        description: "Палетка теней ABH Modern Renaissance. 14 оттенков: матовые и шиммерные. Долговременная стойкость.",
        sizes: [],
        availability: "В наличии", viewsCount: 378, contactClicksCount: 31,
      },
      {
        title: "Тушь L'Oréal Telescopic",
        price: 390, oldPrice: 490,
        category: "Косметика", subCategory: "Макияж",
        images: [pic("mascara-a")],
        description: "Тушь для ресниц L'Oréal Telescopic. Удлиняющая формула, разделяющая кисть. Чёрный, 8 мл.",
        sizes: [],
        availability: "В наличии", viewsCount: 167, contactClicksCount: 14,
      },
      {
        title: "Сыворотка с витамином C Garnier",
        price: 490, oldPrice: null,
        category: "Косметика", subCategory: "Уход за лицом",
        images: [pic("garnier-a"), pic("garnier-b")],
        description: "Сыворотка Garnier Vitamin C. Осветляет тон, уменьшает пятна, придаёт сияние. 30 мл.",
        sizes: [],
        availability: "В наличии", viewsCount: 213, contactClicksCount: 18,
      },
      {
        title: "Набор Kerastase Nutritive",
        price: 1890, oldPrice: 2390,
        category: "Косметика", subCategory: "Уход за волосами",
        images: [pic("kerastase-a"), pic("kerastase-b")],
        description: "Набор Kerastase Nutritive: шампунь 250 мл + маска 200 мл для сухих волос.",
        sizes: [],
        availability: "В наличии", viewsCount: 156, contactClicksCount: 13,
      },
      {
        title: "Фиксирующий спрей NYX Setting Spray",
        price: 290, oldPrice: null,
        category: "Косметика", subCategory: "Макияж",
        images: [pic("nyx-a")],
        description: "Фиксирующий спрей NYX. Удерживает макияж до 16 часов. 60 мл.",
        sizes: [],
        availability: "В наличии", viewsCount: 98, contactClicksCount: 8,
      },
    ],
  },

  // ── 7 Jewelry Tiraspol ──
  {
    instagram: "jewelry_tiraspol",
    name: "Jewelry Tiraspol",
    slug: "jewelry_tiraspol",
    description: "Украшения и бижутерия в Тирасполе. Серебро, позолота, натуральные камни. Подарки на любой повод.",
    phone: "+373 777 65 43",
    telegram: "jewelry_tiraspol",
    viber: null,
    cities: ["Тирасполь","Бендеры"],
    isVerified: false,
    avatarUrl: pic("jewelry-logo", 200, 200),
    coverUrl: pic("jewelry-cover", 1200, 400),
    products: [
      {
        title: "Кольцо серебро 925 «Волна»",
        price: 490, oldPrice: null,
        category: "Украшения", subCategory: "Кольца",
        images: [pic("ring-a"), pic("ring-b")],
        description: "Серебряное кольцо 925 пробы с волнообразным узором. Минималистичный дизайн. Размеры 15–19.",
        sizes: ["15","16","17","18","19"],
        availability: "В наличии", viewsCount: 234, contactClicksCount: 19,
      },
      {
        title: "Серьги позолота «Tiny Stars»",
        price: 290, oldPrice: 390,
        category: "Украшения", subCategory: "Серьги",
        images: [pic("earrings-a"), pic("earrings-b")],
        description: "Маленькие серьги-пусеты в виде звёздочек. Позолота 18К, гипоаллергенная основа.",
        sizes: [],
        availability: "В наличии", viewsCount: 312, contactClicksCount: 25,
      },
      {
        title: "Цепочка «Herringbone» золото",
        price: 890, oldPrice: null,
        category: "Украшения", subCategory: "Цепочки",
        images: [pic("chain-a"), pic("chain-b")],
        description: "Плоская цепочка-Herringbone. Позолота 18К, длина 40 см + удлинитель 5 см.",
        sizes: [],
        availability: "В наличии", viewsCount: 198, contactClicksCount: 17,
      },
      {
        title: "Браслет «Pearl» жемчуг",
        price: 390, oldPrice: null,
        category: "Украшения", subCategory: "Браслеты",
        images: [pic("bracelet-a"), pic("bracelet-b")],
        description: "Браслет с искусственным жемчугом. Белый / кремовый. Регулируемый размер.",
        sizes: [],
        availability: "В наличии", viewsCount: 167, contactClicksCount: 14,
      },
      {
        title: "Подвеска «Moon» серебро 925",
        price: 390, oldPrice: null,
        category: "Украшения", subCategory: "Кулоны",
        images: [pic("pendant-a"), pic("pendant-b")],
        description: "Подвеска в форме луны. Серебро 925, покрытие родием. Цепочка в комплекте 45 см.",
        sizes: [],
        availability: "В наличии", viewsCount: 143, contactClicksCount: 12,
      },
      {
        title: "Набор украшений «Gift Set»",
        price: 690, oldPrice: 990,
        category: "Украшения", subCategory: null,
        images: [pic("gift-set-a"), pic("gift-set-b")],
        description: "Подарочный набор: серьги + кольцо + браслет в стиле минимализм. Позолота. В коробочке.",
        sizes: ["16","17","18"],
        availability: "В наличии", viewsCount: 287, contactClicksCount: 24,
      },
    ],
  },

  // ── 8 Vintage Corner PMR ──
  {
    instagram: "vintage_pmr",
    name: "Vintage Corner PMR",
    slug: "vintage_pmr",
    description: "Винтаж и секонд-хэнд в Тирасполе. Брендовые вещи в отличном состоянии. Уникальные находки каждую неделю.",
    phone: "+373 777 34 56",
    telegram: "vintage_pmr",
    viber: null,
    cities: ["Тирасполь"],
    isVerified: false,
    avatarUrl: pic("vintage-logo", 200, 200),
    coverUrl: pic("vintage-cover", 1200, 400),
    products: [
      {
        title: "Куртка Levi's джинсовая (vintage)",
        price: 890, oldPrice: null,
        category: "Одежда", subCategory: "Куртки",
        images: [pic("levis-a"), pic("levis-b"), pic("levis-c")],
        description: "Оригинальная джинсовая куртка Levi's 90-х. Состояние: отличное. Размер M. Светло-синий денним.",
        sizes: ["M"],
        availability: "В наличии", viewsCount: 378, contactClicksCount: 32,
      },
      {
        title: "Рубашка Ralph Lauren Oxford",
        price: 490, oldPrice: 690,
        category: "Одежда", subCategory: "Рубашки",
        images: [pic("rl-shirt-a"), pic("rl-shirt-b")],
        description: "Рубашка Polo Ralph Lauren Oxford. Классический крой, размер M. Белая в мелкую клетку.",
        sizes: ["M"],
        availability: "В наличии", viewsCount: 212, contactClicksCount: 18,
      },
      {
        title: "Сумка Coach кожаная (vintage)",
        price: 1190, oldPrice: null,
        category: "Сумки", subCategory: null,
        images: [pic("coach-a"), pic("coach-b"), pic("coach-c")],
        description: "Кожаная сумка Coach США 2000-х. Натуральная коричневая кожа. Состояние: очень хорошее.",
        sizes: [],
        availability: "В наличии", viewsCount: 445, contactClicksCount: 37,
      },
      {
        title: "Ремень кожаный Polo Ralph Lauren",
        price: 290, oldPrice: null,
        category: "Аксессуары", subCategory: null,
        images: [pic("belt-polo-a")],
        description: "Кожаный ремень Polo Ralph Lauren. Ширина 3 см, длина 110 см. Коричневый, золотая пряжка.",
        sizes: ["110 см"],
        availability: "В наличии", viewsCount: 134, contactClicksCount: 11,
      },
      {
        title: "Tommy Hilfiger свитшот (L)",
        price: 590, oldPrice: 890,
        category: "Одежда", subCategory: "Свитера",
        images: [pic("tommy-a"), pic("tommy-b")],
        description: "Оригинальный свитшот Tommy Hilfiger. Классическое лого, размер L. Тёмно-синий.",
        sizes: ["L"],
        availability: "В наличии", viewsCount: 289, contactClicksCount: 24,
      },
      {
        title: "Очки Ray-Ban Wayfarer оригинал",
        price: 790, oldPrice: null,
        category: "Аксессуары", subCategory: null,
        images: [pic("rayban-a"), pic("rayban-b")],
        description: "Солнцезащитные очки Ray-Ban RB2140 Wayfarer. Чёрная оправа, линзы G-15. Оригинал.",
        sizes: [],
        availability: "В наличии", viewsCount: 334, contactClicksCount: 28,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Сидирование базы данных...\n");

  for (const shop of stores) {
    const email = `${shop.instagram}@unclaimed.e-vitrina.com`;
    const hashedPassword = await bcrypt.hash(`pmr_${shop.instagram}2026`, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`⏭  Пропуск (уже существует): ${shop.instagram}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: shop.name,
        email,
        password: hashedPassword,
        instagram: shop.instagram,
        instagramUrl: `https://instagram.com/${shop.instagram}`,
        avatar: shop.avatarUrl,
        store: {
          create: {
            name: shop.name,
            slug: shop.slug,
            description: shop.description,
            instagram: shop.instagram,
            phone: shop.phone ?? null,
            telegram: shop.telegram ?? null,
            viber: shop.viber ?? null,
            cities: shop.cities,
            avatarUrl: shop.avatarUrl ?? null,
            coverUrl: shop.coverUrl ?? null,
            isVerified: shop.isVerified,
          },
        },
      },
      include: { store: true },
    });

    const storeId = user.store!.id;

    for (const p of shop.products) {
      await prisma.product.create({
        data: {
          title: p.title,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          category: p.category,
          subCategory: p.subCategory ?? null,
          images: p.images,
          description: p.description,
          sizes: p.sizes,
          status: "Активен",
          availability: p.availability,
          viewsCount: p.viewsCount,
          contactClicksCount: p.contactClicksCount,
          userId: user.id,
          storeId,
        },
      });
    }

    console.log(`✅ ${shop.name} — ${shop.products.length} товаров`);
  }

  const totalStores = await prisma.store.count();
  const totalProducts = await prisma.product.count();
  console.log(`\n🎉 Итого магазинов: ${totalStores} | товаров: ${totalProducts}`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
