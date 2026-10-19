import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./AdminClient";
import { ShieldAlert, Users, Package, Store, ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAIL || session.user.email !== ADMIN_EMAIL) {
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
  const [stores, products, totalUsers, reports, banners] = await Promise.all([
    prisma.store.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.findMany({
      include: {
        store: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count(),
    prisma.productReport.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true,
            deletedAt: true,
            store: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.banner.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  const pendingReportsCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад в дашборд
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Панель Супер-Админа
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление магазинами, товарами и модерацией жалоб на E-Vitrina PMR
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      {/* Сводка */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
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
        <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm outline outline-1 outline-gray-200">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Пользователи</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900">{totalUsers}</span>
        </div>
        <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm outline outline-1 outline-gray-200">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Megaphone className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium">Баннеры</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{banners.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              ({banners.filter((b) => b.isActive).length} акт.)
            </span>
          </div>
        </div>
        <div className={`flex flex-col rounded-2xl p-5 shadow-sm outline outline-1 transition-all ${
          pendingReportsCount > 0 
            ? "bg-rose-50/70 outline-rose-200 text-rose-900" 
            : "bg-white outline-gray-200 text-gray-900"
        }`}>
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ShieldAlert className={`h-5 w-5 ${pendingReportsCount > 0 ? "text-rose-600" : ""}`} />
            <span className="text-sm font-medium">Жалобы</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${pendingReportsCount > 0 ? "text-rose-600" : ""}`}>
              {pendingReportsCount}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {pendingReportsCount > 0 ? "новых" : "нет новых"} (всего: {reports.length})
            </span>
          </div>
        </div>
      </div>

      <AdminClient
        stores={stores}
        products={products as any}
        reports={reports as any}
        banners={banners as any}
      />
    </div>
  );
}
