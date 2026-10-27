import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Applying precise image and store updates...");

  // 1. Кроссовки Puma RS-X Reinvention
  await prisma.product.update({
    where: { id: "9d041fd0-fc6a-4467-aa6b-c4541cc2a27e" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1750270438660-f57de76532cc?w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      ],
    },
  });
  console.log("✅ 1. Puma RS-X Reinvention photo updated.");

  // 2. Кроссовки Nike Air Force 1 '07
  await prisma.product.update({
    where: { id: "e553747a-8965-4619-a45c-21daa9373ae8" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1601144537844-c2a0494aeb41?w=800&q=80",
        "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80",
      ],
      storeId: "cmuucltax000179pot02f2w6r", // Сникерхэд ПМР
      userId: "9afdbb9d-836d-4174-af77-1a0247e9bd5f",
    },
  });
  console.log("✅ 2. Nike Air Force 1 '07 photo & store updated to Сникерхэд ПМР.");

  // 3. Кроссовки New Balance 574 Classic
  await prisma.product.update({
    where: { id: "0faa9b37-8f15-47dd-b6e3-4141a2f0be07" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
        "https://images.unsplash.com/photo-1582076197780-20fab84bc271?w=800&q=80",
      ],
      storeId: "cmuucltax000179pot02f2w6r", // Сникерхэд ПМР
      userId: "9afdbb9d-836d-4174-af77-1a0247e9bd5f",
    },
  });
  console.log("✅ 3. New Balance 574 Classic photo & store updated to Сникерхэд ПМР.");

  // 4. Худи Оверсайз «Minimalist» Cotton
  await prisma.product.update({
    where: { id: "e0e4c92c-cbf3-4512-8a9e-30429109fb58" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80",
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
      ],
      storeId: "cmuuclut7000379po6fsqe0s1", // Модный Шкаф
      userId: "3e3e318b-ea87-4204-bd8d-68470c9b0da1",
    },
  });
  console.log("✅ 4. Худи Оверсайз «Minimalist» Cotton photo & store updated to Модный Шкаф.");

  // 5. Зимняя утепленная куртка Arctic Parka
  await prisma.product.update({
    where: { id: "4edabe4f-a5b2-493f-82bc-acb1a36229d6" },
    data: {
      storeId: "cmuuclut7000379po6fsqe0s1", // Модный Шкаф
      userId: "3e3e318b-ea87-4204-bd8d-68470c9b0da1",
    },
  });
  console.log("✅ 5. Зимняя куртка Arctic Parka store updated to Модный Шкаф.");

  // 6. Спортивный костюм Sport Fleece 2-in-1
  await prisma.product.update({
    where: { id: "e77ad685-4e2c-4343-a778-7a1e092f1644" },
    data: {
      storeId: "cmuuclut7000379po6fsqe0s1", // Модный Шкаф
      userId: "3e3e318b-ea87-4204-bd8d-68470c9b0da1",
    },
  });
  console.log("✅ 6. Спортивный костюм Sport Fleece store updated to Модный Шкаф.");

  // 7. Солнцезащитный крем SPF 50+ Round Lab Birch Juice
  await prisma.product.update({
    where: { id: "f03e87ca-1895-4a08-b210-02e84fa9f3ef" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1598662779094-110c2bad80b5?w=800&q=80",
      ],
    },
  });
  console.log("✅ 7. Солнцезащитный крем SPF 50+ photo updated to sunscreen tube.");

  // 8. Гидрогелевые патчи для глаз с золотом и муцином
  await prisma.product.update({
    where: { id: "92790c1e-5c9b-42fa-833f-9c1927fa2069" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      ],
    },
  });
  console.log("✅ 8. Гидрогелевые патчи для глаз photo updated to eye patch jar.");

  // 9. Увлажняющий крем для лица
  await prisma.product.update({
    where: { id: "0f122b96-1a8f-4845-91d3-f18f52873dc0" },
    data: {
      images: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
      ],
    },
  });
  console.log("✅ 9. Увлажняющий крем для лица photo updated to moisturizing cream jar.");

  console.log("All updates completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
