import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Store as StoreIcon,
  Eye,
  TrendingUp,
  MessageCircle,
  Plus,
  ArrowUpRight,
  ArrowRight,
  AlertCircle,
  Percent,
  Sparkles,
  KeyRound,
} from "lucide-react";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Главная | E-Vitrina PMR",
};

// ⚙️ Переключатель: false = показывать карточку «Скоро» вместо живой статистики (код метрик сохранен)
const ENABLE_REAL_METRICS = true;

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.email) {
    redirect("/login");
  }

  const userFilter = session.user.id
    ? { id: session.user.id }
    : { email: session.user.email as string };

  const productFilter = session.user.id
    ? { userId: session.user.id }
    : { user: { email: session.user.email as string } };

  // Получаем статистику для продавца параллельно (код метрик сохранен)
  const [
    totalProducts,
    activeProducts,
    storeInfo,
    aggregates,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({
      where: {
        ...productFilter,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        ...productFilter,
        deletedAt: null,
        status: "Активен",
      },
    }),
    prisma.user.findFirst({
      where: userFilter,
      select: {
        id: true,
        name: true,
        email: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            avatarUrl: true,
            cities: true,
          },
        },
      },
    }),
    prisma.product.aggregate({
      where: {
        ...productFilter,
        deletedAt: null,
      },
      _sum: {
        viewsCount: true,
        contactClicksCount: true,
      },
    }),
    prisma.product.findMany({
      where: {
        ...productFilter,
        deletedAt: null,
      },
      orderBy: [
        { contactClicksCount: "desc" },
        { viewsCount: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        oldPrice: true,
        category: true,
        images: true,
        status: true,
        viewsCount: true,
        contactClicksCount: true,
      },
    }),
  ]);

  const totalViews = aggregates._sum.viewsCount || 0;
  const totalClicks = aggregates._sum.contactClicksCount || 0;
  const conversionRate =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  const store = storeInfo?.store;
  const sellerDisplayName = store?.name || storeInfo?.name || "Продавец";
  const hasNoCities = !store?.cities || store.cities.length === 0;
  const isUnclaimed = storeInfo?.email?.includes("@unclaimed.") || false;

  return (
    <main className="flex-1 px-4 py-8 pb-24 md:px-8 md:pb-8 mx-auto max-w-7xl w-full">
      {/* ── Заголовок и быстрые кнопки ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            Добро пожаловать, {sellerDisplayName}! 👋
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Это сводная статистика вашего магазина на платформе E-Vitrina PMR.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {store?.slug && (
            <Link
              href={`/shop/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
            >
              <StoreIcon className="w-4 h-4 text-gray-500" />
              <span>Моя витрина</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          )}

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить товар</span>
          </Link>
        </div>
      </div>

      {/* ── Предупреждение для аккаунтов с временным ключом ── */}
      {isUnclaimed && (
        <div className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-xs">
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
                  Ваша витрина привязана к техническому логину <b>{storeInfo?.email}</b>. Привяжите вашу личную почту и задайте постоянный пароль, чтобы закрепить магазин за собой.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/settings#security"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs sm:text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
            >
              <span>Привязать почту и пароль</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Предупреждение о ненастроенных городах доставки ── */}
      {hasNoCities && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 sm:mt-0">
                <AlertCircle className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-900">
                  Укажите города доставки вашего магазина
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Пока вы не выбрали города работы, ваши товары не будут отображаться покупателям при фильтрации по городам на главной странице.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs sm:text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
            >
              <span>Настроить города</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Карточки метрик (если ENABLE_REAL_METRICS = false, показывается иконка «Скоро») ─── */}
      {ENABLE_REAL_METRICS ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Карточка 1: Просмотры товаров */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Просмотры товаров</span>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {totalViews.toLocaleString("ru-RU")}
              </h3>
            </div>
            <p className="mt-4 text-xs text-gray-400">Суммарный интерес покупателей к каталогу</p>
          </div>

          {/* Карточка 2: Переходы в мессенджеры */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Контакты / Лиды</span>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {totalClicks.toLocaleString("ru-RU")}
              </h3>
            </div>
            <p className="mt-4 text-xs text-gray-400">Клики по Telegram, Viber, Instagram и тел.</p>
          </div>

          {/* Карточка 3: Конверсия в обращение */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Конверсия в связь</span>
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {conversionRate}%
              </h3>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              {totalViews > 0
                ? `${totalClicks} обращений на ${totalViews} просмотров`
                : "Появится с первыми просмотрами"}
            </p>
          </div>

          {/* Карточка 4: Всего товаров */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Всего товаров</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {totalProducts}
                </h3>
                <span className="text-xs text-green-600 font-medium">
                  ({activeProducts} активных)
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/products"
              className="mt-4 text-xs sm:text-sm text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Управлять товарами</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Режим с иконкой «Скоро» для переходов и аналитики */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <Link
              href="/dashboard/products"
              className="mt-auto text-sm text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Управлять товарами</span>
              <span>&rarr;</span>
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
                <StoreIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Профиль магазина</p>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {store ? "Заполнен" : "Не заполнен"}
                </h3>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="mt-auto text-sm text-purple-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Перейти в настройки</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Карточка 4: Клики и аналитика (Иконка Скоро) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col opacity-75">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 font-medium">Переходы (клики)</p>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">
                    Скоро
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Скоро</h3>
              </div>
            </div>
            <p className="mt-auto text-xs text-gray-400">
              Статистика по кликам и просмотрам появится в следующих обновлениях
            </p>
          </div>
        </div>
      )}

      {/* ── Секция: Популярные товары продавца (сохранена, отображается при включенных метриках) ── */}
      {ENABLE_REAL_METRICS && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Популярные товары магазина</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Товары с наибольшим количеством просмотров и переходов в мессенджеры
              </p>
            </div>
            <Link
              href="/dashboard/products"
              className="text-xs sm:text-sm text-primary font-semibold hover:underline"
            >
              Все товары &rarr;
            </Link>
          </div>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topProducts.map((p) => {
                const image = p.images?.[0];
                const views = p.viewsCount || 0;
                const clicks = p.contactClicksCount || 0;
                const conv = views > 0 ? ((clicks / views) * 100).toFixed(0) : "0";

                return (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          className="text-sm sm:text-base font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1"
                        >
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {formatPrice(p.price)}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 truncate">{p.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
                          title="Просмотры товара"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{views}</span>
                        </div>

                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold"
                          title="Клики по контактам"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{clicks}</span>
                        </div>

                        <div
                          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                          title="Конверсия просмотров в контакты"
                        >
                          <span>CR: {conv}%</span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/edit/${p.id}`}
                        className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        Редактировать
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">В магазине пока нет товаров</p>
              <p className="text-xs text-gray-400 mt-1">
                Добавьте товары, чтобы здесь отображалась статистика просмотров и обращений
              </p>
              <Link
                href="/dashboard/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Создать первый товар</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Баннер статуса магазина ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-100/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {store ? `Магазин «${store.name}» настроен` : "Заполните профиль магазина"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {store
                ? "Убедитесь, что ваши контакты актуальны — так покупатели быстрее свяжутся с вами."
                : "Укажите Telegram, Viber, Instagram и контакты, чтобы принимать заказы."}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-gray-900 border border-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors shadow-xs shrink-0"
        >
          {store ? "Настройки профиля" : "Настроить магазин →"}
        </Link>
      </div>
    </main>
  );
}
