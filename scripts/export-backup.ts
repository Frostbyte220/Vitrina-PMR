import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting backup export from Neon DB...");
  const startTime = Date.now();

  const [
    users,
    passwordResetTokens,
    stores,
    products,
    productReports,
    banners,
    messages,
    messageReplies,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.passwordResetToken.findMany(),
    prisma.store.findMany(),
    prisma.product.findMany(),
    prisma.productReport.findMany(),
    prisma.banner.findMany(),
    prisma.message.findMany(),
    prisma.messageReply.findMany(),
  ]);

  const backupData = {
    exportedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      passwordResetTokens: passwordResetTokens.length,
      stores: stores.length,
      products: products.length,
      productReports: productReports.length,
      banners: banners.length,
      messages: messages.length,
      messageReplies: messageReplies.length,
    },
    data: {
      users,
      passwordResetTokens,
      stores,
      products,
      productReports,
      banners,
      messages,
      messageReplies,
    },
  };

  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.json`;
  const filePath = path.join(backupDir, filename);
  const latestFilePath = path.join(backupDir, "latest-backup.json");

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf-8");
  fs.writeFileSync(latestFilePath, JSON.stringify(backupData, null, 2), "utf-8");

  console.log(`✅ Backup successfully saved to ${filePath}`);
  console.log(`✅ Latest backup updated at ${latestFilePath}`);
  console.log("Summary of exported data:", JSON.stringify(backupData.counts, null, 2));
  console.log(`Elapsed time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
}

main()
  .catch((e) => {
    console.error("❌ Backup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
