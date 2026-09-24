import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/dashboard/StoreSettingsForm";

export const metadata = {
  title: "Настройки магазина",
};

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch the store data directly from the database with a safety timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("DB_TIMEOUT")), 7000)
  );

  let store = null;
  try {
    store = await Promise.race([
      prisma.store.findUnique({
        where: { userId: session.user.id },
      }),
      timeoutPromise,
    ]);
  } catch (error: any) {
    console.error("[SETTINGS_PAGE_DB_ERROR]", error);
    // If it fails, we'll pass null to the form, and they can try saving or refreshing
  }


  return (
    <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-text-main">Настройки магазина</h1>
        <StoreSettingsForm initialData={store} />
      </div>
    </main>
  );
}