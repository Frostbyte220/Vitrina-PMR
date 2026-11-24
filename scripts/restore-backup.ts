import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database restore...");
  const backupFile = path.join(process.cwd(), "backups", "latest-backup.json");

  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found at ${backupFile}`);
  }

  const raw = fs.readFileSync(backupFile, "utf-8");
  const backup = JSON.parse(raw);
  const { data } = backup;

  console.log(`Loaded backup from ${backup.exportedAt}`);
  console.log(`Users: ${data.users?.length || 0}`);
  console.log(`Stores: ${data.stores?.length || 0}`);
  console.log(`Products: ${data.products?.length || 0}`);

  // 1. Users
  console.log("\nRestoring Users...");
  for (const user of data.users || []) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        instagram: user.instagram,
        instagramUrl: user.instagramUrl,
        avatar: user.avatar,
        favorites: user.favorites || [],
        createdAt: new Date(user.createdAt),
      },
      update: {
        name: user.name,
        email: user.email,
        password: user.password,
        instagram: user.instagram,
        instagramUrl: user.instagramUrl,
        avatar: user.avatar,
        favorites: user.favorites || [],
      },
    });
  }
  console.log("✅ Users restored.");

  // 2. Stores
  console.log("\nRestoring Stores...");
  for (const store of data.stores || []) {
    await prisma.store.upsert({
      where: { id: store.id },
      create: {
        id: store.id,
        userId: store.userId,
        name: store.name,
        slug: store.slug,
        description: store.description,
        instagram: store.instagram,
        phone: store.phone,
        telegram: store.telegram,
        telegramChatId: store.telegramChatId,
        viber: store.viber,
        cities: store.cities || [],
        avatarUrl: store.avatarUrl,
        coverUrl: store.coverUrl,
        isVerified: store.isVerified || false,
        viewsCount: store.viewsCount || 0,
        createdAt: new Date(store.createdAt),
        updatedAt: new Date(store.updatedAt),
      },
      update: {
        userId: store.userId,
        name: store.name,
        slug: store.slug,
        description: store.description,
        instagram: store.instagram,
        phone: store.phone,
        telegram: store.telegram,
        telegramChatId: store.telegramChatId,
        viber: store.viber,
        cities: store.cities || [],
        avatarUrl: store.avatarUrl,
        coverUrl: store.coverUrl,
        isVerified: store.isVerified || false,
        viewsCount: store.viewsCount || 0,
      },
    });
  }
  console.log("✅ Stores restored.");

  // 3. Products
  console.log("\nRestoring Products...");
  for (const product of data.products || []) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        title: product.title,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        categories: product.categories || [],
        subCategory: product.subCategory,
        images: product.images || [],
        description: product.description,
        sizes: product.sizes || [],
        variants: product.variants ?? undefined,
        status: product.status || "Активен",
        availability: product.availability || "В наличии",
        deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
        userId: product.userId,
        storeId: product.storeId,
        viewsCount: product.viewsCount || 0,
        contactClicksCount: product.contactClicksCount || 0,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
      update: {
        title: product.title,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        categories: product.categories || [],
        subCategory: product.subCategory,
        images: product.images || [],
        description: product.description,
        sizes: product.sizes || [],
        variants: product.variants ?? undefined,
        status: product.status,
        availability: product.availability,
        deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
        userId: product.userId,
        storeId: product.storeId,
        viewsCount: product.viewsCount,
        contactClicksCount: product.contactClicksCount,
      },
    });
  }
  console.log("✅ Products restored.");

  // 4. Banners
  if (data.banners?.length) {
    console.log("\nRestoring Banners...");
    for (const banner of data.banners) {
      await prisma.banner.upsert({
        where: { id: banner.id },
        create: {
          id: banner.id,
          title: banner.title,
          sub: banner.sub,
          label: banner.label,
          cta: banner.cta,
          href: banner.href,
          bg: banner.bg,
          emoji: banner.emoji,
          imageUrl: banner.imageUrl,
          isActive: banner.isActive,
          order: banner.order,
          createdAt: new Date(banner.createdAt),
          updatedAt: new Date(banner.updatedAt),
        },
        update: {
          title: banner.title,
          sub: banner.sub,
          label: banner.label,
          cta: banner.cta,
          href: banner.href,
          bg: banner.bg,
          emoji: banner.emoji,
          imageUrl: banner.imageUrl,
          isActive: banner.isActive,
          order: banner.order,
        },
      });
    }
    console.log("✅ Banners restored.");
  }

  console.log("\n🎉 Database restoration completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Restore failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
