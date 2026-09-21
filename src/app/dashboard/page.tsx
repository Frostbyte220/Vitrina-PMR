import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Store, Eye, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Главная | Vitrina PMR",
};

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Получаем статистику для продавца
  const [totalProducts, activeProducts, storeInfo] = await Promise.all([
    prisma.product.count({
      where: { 
        user: { email: session.user.email },
        deletedAt: null
      }
    }),
    prisma.product.count({
      where: { 
        user: { email: session.user.email },
        deletedAt: null,
        status: "Активен"
      }
    }),
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, store: true }
    })
  ]);

  return (
    <main className="flex-1 px-4 py-8 pb-24 md:px-8 md:pb-8 mx-auto max-w-7xl w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          Добро пожаловать, {storeInfo?.name || "Продавец"}! 👋
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Это сводная статистика вашего магазина на платформе Vitrina PMR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Карточка 1: Всего товаров */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Всего товаров</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
            </div>
          </div>
          <Link href="/dashboard/products" className="mt-auto text-sm text-blue-600 font-medium hover:underline">
            Управлять товарами &rarr;
          </Link>
        </div>

        {/* Карточка 2: Активные товары */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Активные (на витрине)</p>
              <h3 className="text-2xl font-bold text-gray-900">{activeProducts}</h3>
            </div>
          </div>
          <p className="mt-auto text-xs text-gray-400">Товары, доступные покупателям</p>
        </div>

        {/* Карточка 3: Настройки магазина */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Профиль магазина</p>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {storeInfo?.store ? "Заполнен" : "Не заполнен"}
              </h3>
            </div>
          </div>
          <Link href="/dashboard/settings" className="mt-auto text-sm text-purple-600 font-medium hover:underline">
            Перейти в настройки &rarr;
          </Link>
        </div>
        
        {/* Карточка 4: Клики (В разработке) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col opacity-60">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Переходы (клики)</p>
              <h3 className="text-xl font-bold text-gray-900">Скоро</h3>
            </div>
          </div>
          <p className="mt-auto text-xs text-gray-400">Статистика по кликам появится в следующих обновлениях</p>
        </div>
      </div>

    </main>
  );
}