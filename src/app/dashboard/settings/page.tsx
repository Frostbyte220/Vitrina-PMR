import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/dashboard/StoreSettingsForm";
import { AccountSecurityForm } from "@/components/dashboard/AccountSecurityForm";
import { KeyRound, ArrowDown } from "lucide-react";

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

  let store = null;
  let user = null;

  try {
    [store, user] = await Promise.all([
      prisma.store.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, instagram: true },
      }),
    ]);

    // Если Store еще не существует, подтягиваем данные из профиля User для автозаполнения
    if (!store && user) {
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
  } catch (error: any) {
    console.error("[SETTINGS_PAGE_DB_ERROR]", error);
  }

  const isUnclaimed = user?.email?.includes("@unclaimed.") || false;

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Настройки магазина</h1>
          <p className="mt-1 text-sm text-text-muted">
            Оформление витрины, контактные данные для связи с покупателями и безопасность аккаунта
          </p>
        </div>

        {/* ── Баннер для продавцов с временным доступом ── */}
        {isUnclaimed && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-200/70 text-amber-900 rounded-xl mt-0.5 sm:mt-0">
                  <KeyRound className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950">
                    Вы вошли по временному доступу!
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-amber-800">
                    Витрина сейчас привязана к техническому логину <b>{user?.email}</b>. Обязательно привяжите вашу постоянную почту и задайте личный пароль в блоке ниже.
                  </p>
                </div>
              </div>
              <a
                href="#security"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs sm:text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                <span>Привязать почту</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* ── Форма настроек витрины ── */}
        <StoreSettingsForm initialData={store} isNew={isNew} />

        {/* ── Форма смены логина (email) и пароля ── */}
        <AccountSecurityForm
          currentEmail={user?.email || ""}
          isUnclaimed={isUnclaimed}
        />
      </div>
    </main>
  );
}
