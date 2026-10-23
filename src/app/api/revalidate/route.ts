import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET || process.env.CRON_SECRET;

  // Проверка по секретному токену (для вебхуков/cron)
  const isSecretValid = Boolean(expectedSecret && secret && secret === expectedSecret);

  // Либо проверка по сессии администратора
  let isAdmin = false;
  if (!isSecretValid) {
    const session = await getServerSession(authOptions);
    const adminEmail = process.env.ADMIN_EMAIL;
    isAdmin = Boolean(
      session?.user?.email &&
      adminEmail &&
      session.user.email.toLowerCase() === adminEmail.toLowerCase()
    );
  }

  if (!isSecretValid && !isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Предоставьте валидный ?secret=... или войдите под администратором." },
      { status: 401 }
    );
  }

  revalidateTag("products");
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
