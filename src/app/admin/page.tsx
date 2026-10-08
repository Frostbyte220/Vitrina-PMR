import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./AdminClient";
import { ShieldAlert, Users, Package, Store } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "ainol2004@gmail.com";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h1>
        <p className="text-gray-500 mb-6">У вас нет прав для просмотра этой страницы.</p>
        <Link href="/" className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Запрашиваем данные для дашборда
  const [stores, products, totalUsers] = await Promise.all([
    prisma.store.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.findMany({
      include: {
        store: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Панель Супер-Админа
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление магазинами и товарами на E-Vitrina PMR
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      {/* Сводка */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm outline outline-1 outline-gray-200">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium">Магазины</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900">{stores.length}</span>
        </div>
        <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm outline outline-1 outline-gray-200">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Товары</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900">{products.length}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col rounded-2xl bg-white p-5 shadow-sm outline outline-1 outline-gray-200">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Пользователи</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900">{totalUsers}</span>
        </div>
      </div>

      <AdminClient stores={stores} products={products as any} />
    </div>
  );
}
