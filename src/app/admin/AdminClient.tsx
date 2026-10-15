"use client";

import { useState } from "react";
import { Trash2, Store, Package, RefreshCw, AlertTriangle, ExternalLink, EyeOff, ShieldCheck, Flag, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { 
  deleteProductAdmin, 
  restoreProductAdmin, 
  deleteStoreAdmin, 
  migrateProductsAction, 
  fillRandomSizesAction,
  resolveReportAdmin,
  dismissReportAdmin,
  deleteReportAdmin,
  touchAndRevalidateAllProductsAction
} from "./actions";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type StoreData = {
  id: string;
  name: string;
  slug: string;
  instagram: string | null;
  createdAt: Date;
  _count: { products: number };
};

type ProductData = {
  id: string;
  title: string;
  price: number;
  status: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  store: { name: string; slug?: string } | null;
};

export type ReportData = {
  id: string;
  productId: string;
  reason: string;
  details: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: Date;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    status: string | null;
    deletedAt: Date | null;
    store: { name: string; slug: string } | null;
  };
};

export function AdminClient({
  stores,
  products,
  reports = [],
}: {
  stores: StoreData[];
  products: ProductData[];
  reports?: ReportData[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "stores" | "reports">("products");
  const [reportsFilter, setReportsFilter] = useState<"pending" | "all" | "resolved" | "dismissed">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<{ storeId: number; subCategory: number; total: number } | null>(null);
  const [fillingSizes, setFillingSizes] = useState(false);
  const [fillSizesResult, setFillSizesResult] = useState<{ updated: number; total: number } | null>(null);
  const [revalidating, setRevalidating] = useState(false);
  const [revalidateCount, setRevalidateCount] = useState<number | null>(null);

  const handleRevalidateAll = async () => {
    if (!confirm("Сбросить кэш и обновить все товары на витрине?")) return;
    setRevalidating(true);
    setRevalidateCount(null);
    try {
      const res = await touchAndRevalidateAllProductsAction();
      setRevalidateCount(res.count);
      toast.success(`Успешно! Обновлено и сброшен кэш для ${res.count} товаров`);
    } catch {
      toast.error("Ошибка при обновлении товаров");
    } finally {
      setRevalidating(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm("Запустить миграцию данных? Это обновит storeId и subCategory для всех товаров.")) return;
    setMigrating(true);
    setMigrateResult(null);
    try {
      const result = await migrateProductsAction();
      setMigrateResult(result);
      toast.success(`Готово! Обновлено: storeId=${result.storeId}, subCategory=${result.subCategory} из ${result.total} товаров`);
    } catch {
      toast.error("Ошибка миграции");
    } finally {
      setMigrating(false);
    }
  };

  const handleFillSizes = async () => {
    if (!confirm("Добавить случайные размеры всем товарам Одежда/Обувь/Спорт у которых нет размеров?")) return;
    setFillingSizes(true);
    setFillSizesResult(null);
    try {
      const result = await fillRandomSizesAction();
      setFillSizesResult(result);
      toast.success(`Готово! Заполнено ${result.updated} товаров из ${result.total}`);
    } catch {
      toast.error("Ошибка заполнения размеров");
    } finally {
      setFillingSizes(false);
    }
  };


  const handleDeleteProduct = async (id: string, isDeleted: boolean) => {
    if (!confirm(isDeleted ? "Восстановить этот товар?" : "Скрыть этот товар?")) return;
    setLoadingId(id);
    try {
      if (isDeleted) {
        await restoreProductAdmin(id);
        toast.success("Товар восстановлен");
      } else {
        await deleteProductAdmin(id);
        toast.success("Товар скрыт");
      }
    } catch {
      toast.error("Ошибка");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm("ВНИМАНИЕ! Это удалит магазин и все его товары навсегда. Продолжить?")) return;
    setLoadingId(id);
    try {
      await deleteStoreAdmin(id);
      toast.success("Магазин удален");
    } catch {
      toast.error("Ошибка удаления");
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolveReport = async (reportId: string, hideProduct = true) => {
    if (!confirm(hideProduct ? "Скрыть товар с витрины и пометить жалобу решенной?" : "Пометить жалобу решенной?")) return;
    setLoadingId(reportId);
    try {
      await resolveReportAdmin(reportId, hideProduct);
      toast.success(hideProduct ? "Товар скрыт, жалоба решена" : "Жалоба решена");
    } catch {
      toast.error("Ошибка обработки жалобы");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    if (!confirm("Отклонить жалобу (нарушений не обнаружено)?")) return;
    setLoadingId(reportId);
    try {
      await dismissReportAdmin(reportId);
      toast.success("Жалоба отклонена");
    } catch {
      toast.error("Ошибка");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Удалить запись жалобы из базы?")) return;
    setLoadingId(reportId);
    try {
      await deleteReportAdmin(reportId);
      toast.success("Жалоба удалена");
    } catch {
      toast.error("Ошибка");
    } finally {
      setLoadingId(null);
    }
  };

  const pendingReportsCount = reports.filter((r) => r.status === "PENDING").length;
  const resolvedReportsCount = reports.filter((r) => r.status === "RESOLVED").length;
  const dismissedReportsCount = reports.filter((r) => r.status === "DISMISSED").length;

  const filteredReports = reports.filter((r) => {
    if (reportsFilter === "pending") return r.status === "PENDING";
    if (reportsFilter === "resolved") return r.status === "RESOLVED";
    if (reportsFilter === "dismissed") return r.status === "DISMISSED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Баннер миграции данных */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
        {/* Строка 1: Миграция storeId и subCategory */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">🔄 Привязка магазинов и подкатегорий</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Привязывает товары к магазину (storeId) и устанавливает подкатегорию по умолчанию. Запустить один раз.
            </p>
            {migrateResult && (
              <p className="mt-1 text-xs font-medium text-green-700">
                ✅ storeId: {migrateResult.storeId}, subCategory: {migrateResult.subCategory} из {migrateResult.total} товаров
              </p>
            )}
          </div>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${migrating ? "animate-spin" : ""}`} />
            {migrating ? "Выполняется..." : "Запустить"}
          </button>
        </div>

        <div className="border-t border-amber-200" />

        {/* Строка 2: Заполнить размеры */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">👗 Добавить размеры товарам (Одежда / Обувь / Спорт)</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Заполняет реалистичные случайные размеры товарам, у которых поле sizes пустое. Продавцы смогут уточнить потом.
            </p>
            {fillSizesResult && (
              <p className="mt-1 text-xs font-medium text-green-700">
                ✅ Заполнено {fillSizesResult.updated} из {fillSizesResult.total} товаров
              </p>
            )}
          </div>
          <button
            onClick={handleFillSizes}
            disabled={fillingSizes}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${fillingSizes ? "animate-spin" : ""}`} />
            {fillingSizes ? "Выполняется..." : "Добавить размеры"}
          </button>
        </div>

        <div className="border-t border-amber-200" />

        {/* Строка 3: Обновить все товары и сбросить кэш */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">⚡ Обновить все товары и сбросить кэш</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Сбрасывает кэш страниц Next.js и обновляет товары в базе данных, гарантируя показ кнопки «Пожаловаться на товар» у всех посетителей.
            </p>
            {revalidateCount !== null && (
              <p className="mt-1 text-xs font-medium text-green-700">
                ✅ Обновлено и сброшен кэш для {revalidateCount} товаров
              </p>
            )}
          </div>
          <button
            onClick={handleRevalidateAll}
            disabled={revalidating}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${revalidating ? "animate-spin" : ""}`} />
            {revalidating ? "Обновляется..." : "Обновить все товары"}
          </button>
        </div>
      </div>

      {/* Навигация (Табы) */}
      <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm outline outline-1 outline-gray-200">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === "products" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Package className="h-4 w-4" /> Все товары ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("stores")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === "stores" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Store className="h-4 w-4" /> Магазины ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === "reports" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Flag className={`h-4 w-4 ${pendingReportsCount > 0 ? "text-rose-500" : ""}`} />
          <span>Жалобы ({reports.length})</span>
          {pendingReportsCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* Таблица товаров */}
      {activeTab === "products" && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm outline outline-1 outline-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Название</th>
                  <th className="px-4 py-3 font-semibold">Цена</th>
                  <th className="px-4 py-3 font-semibold">Магазин</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isDeleted = p.deletedAt !== null;
                  return (
                    <tr key={p.id} className={`transition-colors hover:bg-gray-50 ${isDeleted ? "bg-red-50/50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="line-clamp-1">{p.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.price} Руб</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {p.store?.name || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            <AlertTriangle className="h-3 w-3" /> Скрыт
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Активен
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id, isDeleted)}
                          disabled={loadingId === p.id}
                          className={`rounded-lg p-2 transition-colors ${
                            isDeleted 
                              ? "text-blue-500 hover:bg-blue-50" 
                              : "text-red-500 hover:bg-red-50"
                          } disabled:opacity-50`}
                          title={isDeleted ? "Восстановить" : "Скрыть товар"}
                        >
                          {loadingId === p.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : isDeleted ? (
                            <RefreshCw className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Таблица магазинов */}
      {activeTab === "stores" && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm outline outline-1 outline-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Магазин</th>
                  <th className="px-4 py-3 font-semibold">Instagram</th>
                  <th className="px-4 py-3 font-semibold text-center">Товаров</th>
                  <th className="px-4 py-3 font-semibold">Регистрация</th>
                  <th className="px-4 py-3 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">/{s.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">
                      {s.instagram ? `@${s.instagram.replace("@", "")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {s._count.products}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteStore(s.id)}
                        disabled={loadingId === s.id}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Удалить магазин навсегда"
                      >
                        {loadingId === s.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Вкладка жалоб */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Фильтры жалоб */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReportsFilter("pending")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                reportsFilter === "pending"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Новые ({pendingReportsCount})
            </button>
            <button
              onClick={() => setReportsFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                reportsFilter === "all"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Все ({reports.length})
            </button>
            <button
              onClick={() => setReportsFilter("resolved")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                reportsFilter === "resolved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Решенные ({resolvedReportsCount})
            </button>
            <button
              onClick={() => setReportsFilter("dismissed")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                reportsFilter === "dismissed"
                  ? "bg-gray-700 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Отклоненные ({dismissedReportsCount})
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm outline outline-1 outline-gray-200">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mb-3" />
              <p className="text-base font-bold text-gray-900">Жалоб в этой категории нет</p>
              <p className="mt-1 text-xs text-gray-500">Все проверено, нарушений не найдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => {
                const product = report.product;
                const isProductDeleted = product?.deletedAt !== null;
                const isLoading = loadingId === report.id;

                return (
                  <div
                    key={report.id}
                    className={`rounded-2xl bg-white p-5 shadow-sm outline outline-1 transition-all ${
                      report.status === "PENDING"
                        ? "outline-rose-300 ring-2 ring-rose-500/10"
                        : "outline-gray-200"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Левая колонка: Товар */}
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Превью фото товара */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                          {product?.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title || "Товар"}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              Нет фото
                            </div>
                          )}
                        </div>

                        {/* Инфо о товаре */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Статус жалобы */}
                            {report.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                <AlertTriangle className="h-3 w-3" /> Ожидает проверки
                              </span>
                            )}
                            {report.status === "RESOLVED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                <Check className="h-3 w-3" /> Решено / Товар скрыт
                              </span>
                            )}
                            {report.status === "DISMISSED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                                Отклонена
                              </span>
                            )}

                            {isProductDeleted && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                                Скрыт с сайта
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-gray-900 line-clamp-1">
                            {product?.title || "Товар удален"}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            {product?.price !== undefined && (
                              <span className="font-semibold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                            )}
                            {product?.store?.name && (
                              <span>
                                Магазин:{" "}
                                <span className="font-medium text-gray-700">
                                  {product.store.name}
                                </span>
                              </span>
                            )}
                            <span>
                              Дата: {new Date(report.createdAt).toLocaleString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Ссылка на товар на витрине */}
                          {product && (
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <span>Открыть страницу товара</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Правая колонка: Действия */}
                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                        {report.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleResolveReport(report.id, true)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50"
                              title="Скрыть товар с витрины и пометить жалобу решенной"
                            >
                              {isLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                              <span>Скрыть товар</span>
                            </button>

                            <button
                              onClick={() => handleDismissReport(report.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                              title="Отклонить жалобу (нарушений нет)"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Отклонить</span>
                            </button>
                          </>
                        )}

                        {report.status === "RESOLVED" && isProductDeleted && (
                          <button
                            onClick={() => handleDeleteProduct(product.id, true)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                            title="Восстановить отображение товара"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Восстановить товар</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={isLoading}
                          className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Удалить запись жалобы"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Блок с деталями жалобы */}
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                        <Flag className="h-3.5 w-3.5 text-rose-500" />
                        <span>Причина:</span>
                        <span className="rounded-md bg-rose-100/80 px-2 py-0.5 text-rose-800">
                          {report.reason}
                        </span>
                      </div>
                      {report.details ? (
                        <p className="mt-1.5 text-gray-700 pl-5.5 leading-relaxed">
                          «{report.details}»
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-400 pl-5.5 italic">
                          Пользователь не оставил дополнительного комментария.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
