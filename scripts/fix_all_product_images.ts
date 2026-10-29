import { prisma } from "../src/lib/prisma";

const updates = [
  {
    id: "f03e87ca-1895-4a08-b210-02e84fa9f3ef",
    title: "Солнцезащитный крем SPF 50+ Round Lab Birch Juice",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    ],
  },
  {
    id: "39e4c913-7fee-4278-88f4-19c9a55f0387",
    title: "Кроссовки Nike Air Jordan 1 Retro High",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
    ],
  },
  {
    id: "88c7c275-be03-4d2f-9986-b64419170461",
    title: "Тренч классический двубортный песочный",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    ],
  },
  {
    id: "d3703116-922e-48e7-a811-95eafeb1d31d",
    title: "Классический тренч",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    ],
  },
  {
    id: "266c36e6-e1e9-4ff1-a8d2-3f90d6379739",
    title: "Вязаный свитер крупной вязки с косами",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    ],
  },
  {
    id: "33acb66f-eccb-42eb-96fd-53d33c561be1",
    title: "Джинсы прямого кроя Wide-Leg Vintage Wash",
    images: [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
    ],
  },
  {
    id: "6d297cef-b07d-46df-a389-39915a691ab0",
    title: "Оверсайз худи из плотного футера с начесом",
    images: [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
    ],
  },
  {
    id: "e0e4c92c-cbf3-4512-8a9e-30429109fb58",
    title: "Худи Оверсайз «Minimalist» Cotton",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    ],
  },
  {
    id: "92790c1e-5c9b-42fa-833f-9c1927fa2069",
    title: "Гидрогелевые патчи для глаз с золотом и муцином",
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
    ],
  },
  {
    id: "d1897d60-b446-44cd-8a84-74a037be542d",
    title: "Набор сывороток The Ordinary Niacinamide + Zinc",
    images: [
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
    ],
  },
  {
    id: "4851576f-0d41-4f35-94c3-5e40d5ae1978",
    title: "Беспроводная зарядная станция 3-в-1 MagSafe",
    images: [
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&q=80",
    ],
  },
  {
    id: "c086d456-677c-4fa7-be56-0f757792dd7e",
    title: "Умная колонка Яндекс Станция Миди",
    images: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80",
    ],
  },
  {
    id: "50af1cdd-ef92-4b86-96be-fd9606920581",
    title: "Беспроводные наушники Sony WH-1000XM5",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    ],
  },
  {
    id: "61de24fb-4e3c-495b-a61a-39cc4ee70941",
    title: "Кроссовки Adidas Samba OG Classic",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80",
    ],
  },
  {
    id: "c2cba273-4496-44ea-b092-80864212df38",
    title: "Женские кеды Converse",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80",
    ],
  },
  {
    id: "7495d93b-a841-4b82-bcfd-c4bc3c3967d5",
    title: "Детские кроссовки Adidas",
    images: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80",
    ],
  },
  {
    id: "4edabe4f-a5b2-493f-82bc-acb1a36229d6",
    title: "Зимняя утепленная куртка Arctic Parka",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    ],
  },
];

async function main() {
  console.log(`Starting update of ${updates.length} products in database...`);

  for (const item of updates) {
    const updated = await prisma.product.update({
      where: { id: item.id },
      data: { images: item.images },
      select: { id: true, title: true, images: true },
    });
    console.log(`✅ [${updated.title}] -> ${updated.images[0]}`);
  }

  console.log("\nAll product photos updated successfully!");
}

main()
  .catch((e) => {
    console.error("Update failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
