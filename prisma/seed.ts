import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Очищаем существующие данные перед сидингом (порядок важен из-за связей)
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 2. Создаем тестовых юзеров
  const sneakerHubUser = await prisma.user.create({
    data: {
      name: "SneakerHub",
      email: "sneakerhub@example.com",
      instagram: "sneakerhub_tiraspol",
    },
  });

  const fashionPointUser = await prisma.user.create({
    data: {
      name: "Fashion Point",
      email: "fashionpoint@example.com",
      instagram: "fashionpoint_pmr",
    },
  });

  // 3. Создаем витрины (Store) для этих юзеров
  const sneakerHubStore = await prisma.store.create({
    data: {
      userId: sneakerHubUser.id,
      name: "SneakerHub",
      slug: "sneakerhub",
      instagram: "sneakerhub_tiraspol",
      cities: ["Тирасполь", "Бендеры"],
      avatarUrl: "https://ui-avatars.com/api/?name=Sneaker+Hub&background=random", // Временная аватарка-заглушка
    }
  });

  const fashionPointStore = await prisma.store.create({
    data: {
      userId: fashionPointUser.id,
      name: "Fashion Point",
      slug: "fashionpoint",
      instagram: "fashionpoint_pmr",
      cities: ["Тирасполь"],
      avatarUrl: "https://ui-avatars.com/api/?name=Fashion+Point&background=random",
    }
  });

  // 4. Добавляем товары с привязкой к витринам (storeId) и исправленным полем images
  await prisma.product.createMany({
    data: [
      {
        title: "Кроссовки Nike Air Max",
        price: 7990,
        category: "Обувь",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
        description: "Стильные кроссовки Nike Air Max с амортизацией Air.",
        userId: sneakerHubUser.id,
        storeId: sneakerHubStore.id, // Привязка к витрине
      },
      {
        title: "Кожаная куртка Premium",
        price: 13600,
        category: "Одежда",
        images: ["https://images.unsplash.com/photo-1551028711-00167b16eac5?w=800&q=80"],
        description: "Классическая кожаная куртка из натуральной кожи.",
        userId: fashionPointUser.id,
        storeId: fashionPointStore.id, // Привязка к витрине
      },
      {
        title: "Кроссовки Adidas Ultraboost",
        price: 11200,
        category: "Обувь",
        images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80"],
        description: "Беговые кроссовки Adidas Ultraboost с технологией Boost.",
        userId: sneakerHubUser.id,
        storeId: sneakerHubStore.id, // Привязка к витрине
      },
    ],
  });

  console.log("База данных успешно заполнена тестовыми данными!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });