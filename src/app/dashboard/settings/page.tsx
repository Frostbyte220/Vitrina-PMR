import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/dashboard/StoreSettingsForm";

export const metadata = {
  title: "Настройки магазина",
};

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ new?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isNew = resolvedSearchParams?.new === "true";

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

    // Если Store еще не существует, подтягиваем данные из профиля User для автозаполнения
    if (!store) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, instagram: true },
      });
      if (user) {
        store = {
          name: user.name || "",
          slug: user.instagram || "",
          instagram: user.instagram || "",
          description: "",
          phone: "",
          telegram: "",
          viber: "",
          cities: [],
          avatarUrl: "",
          coverUrl: "",
        };
      }
    }
  } catch (error: any) {
    console.error("[SETTINGS_PAGE_DB_ERROR]", error);
  }

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-text-main">Настройки магазина</h1>
        <StoreSettingsForm initialData={store} isNew={isNew} />
      </div>
    </main>
  );
}
