import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    title: "Кроссовки Nike Air Max",
    price: 7990,
    category: "Обувь",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0f41b6915f86?w=800&q=80",
    ],
    shopName: "SneakerHub",
    shopUsername: "sneakerhub_tiraspol",
    description:
      "Стильные кроссовки Nike Air Max с амортизацией Air. Идеально подходят для повседневной носки и активного образа жизни. Оригинальная продукция.",
  },
  {
    id: "2",
    title: "Кожаная куртка Premium",
    price: 13600,
    category: "Одежда",
    images: [
      "https://images.unsplash.com/photo-1551028711-00167b16eac5?w=800&q=80",
    ],
    shopName: "Fashion Point",
    shopUsername: "fashionpoint_pmr",
    description:
      "Классическая кожаная куртка из натуральной кожи. Универсальный фасон, подходит для любого сезона. Ручная обработка и качественная фурнитура.",
  },
  {
    id: "3",
    title: "Сумка через плечо Minimal",
    price: 4500,
    category: "Аксессуары",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
    shopName: "BagStore",
    shopUsername: "bagstore_tiraspol",
    description:
      "Минималистичная сумка через плечо из экокожи. Компактный размер с достаточным внутренним пространством для ежедневных вещей.",
  },
  {
    id: "4",
    title: "Часы классические Gold",
    price: 8900,
    category: "Аксессуары",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    ],
    shopName: "TimeZone",
    shopUsername: "timezone_pmr",
    description:
      "Элегантные классические часы с золотым покрытием. Японский механизм, водозащита 3 ATM. Подарочная упаковка в комплекте.",
  },
  {
    id: "5",
    title: "Платье летнее Floral",
    price: 3200,
    category: "Одежда",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95b059d581b8?w=800&q=80",
    ],
    shopName: "Bella Moda",
    shopUsername: "bellamoda_pmr",
    description:
      "Лёгкое летнее платье с цветочным принтом. Натуральный хлопок, свободный крой. Доступно в размерах S–XL.",
  },
  {
    id: "6",
    title: "Кроссовки Adidas Ultraboost",
    price: 11200,
    category: "Обувь",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ],
    shopName: "SneakerHub",
    shopUsername: "sneakerhub_tiraspol",
    description:
      "Беговые кроссовки Adidas Ultraboost с технологией Boost. Максимальный комфорт и амортизация для длительных пробежек.",
  },
  {
    id: "7",
    title: "Солнцезащитные очки Aviator",
    price: 2800,
    category: "Аксессуары",
    images: [
      "https://images.unsplash.com/photo-1572635196233-14fbfa7bd7d3?w=800&q=80",
    ],
    shopName: "OpticStyle",
    shopUsername: "opticstyle_pmr",
    description:
      "Классические очки-авиаторы с поляризацией. Защита UV400, металлическая оправа. Стильный аксессуар на каждый день.",
  },
  {
    id: "8",
    title: "Джинсы Slim Fit Dark",
    price: 5400,
    category: "Одежда",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    ],
    shopName: "Denim Lab",
    shopUsername: "denimlab_pmr",
    description:
      "Джинсы slim fit из плотного денима. Тёмно-синий цвет, эластичная ткань для комфорта. Универсальная модель на каждый день.",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProductIds(): string[] {
  return products.map((product) => product.id);
}