"use client";

import { useState } from "react";
import { 
  Trash2, 
  Store, 
  Package, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink, 
  EyeOff, 
  Eye,
  ShieldCheck, 
  Flag, 
  Check, 
  X, 
  Megaphone, 
  Plus, 
  Edit2, 
  Link as LinkIcon,
  BadgeCheck
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { 
  deleteProductAdmin, 
  restoreProductAdmin, 
  deleteStoreAdmin, 
  resolveReportAdmin,
  dismissReportAdmin,
  deleteReportAdmin,
  createBannerAdmin,
  updateBannerAdmin,
  toggleBannerActiveAdmin,
  deleteBannerAdmin,
  toggleStoreVerifiedAdmin
} from "./actions";
import { BannerItem } from "@/lib/banners";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import toast from "react-hot-toast";

const GRADIENT_PRESETS = [
  { label: "Розовый", value: "from-rose-600 to-rose-800" },
  { label: "Фиолетовый", value: "from-violet-600 to-violet-800" },
  { label: "Изумрудный", value: "from-emerald-600 to-emerald-800" },
  { label: "Оранжевый", value: "from-amber-500 to-orange-600" },
  { label: "Синий", value: "from-blue-600 to-indigo-800" },
  { label: "Тёмный", value: "from-gray-800 to-gray-950" },
];

const EMOJI_PRESETS = ["🏪", "👟", "💄", "👗", "⚡", "🔥", "🎁", "🏷️", "📱", "✨"];
const LABEL_PRESETS = ["Реклама", "Акция", "Партнёр", "Новинка", "Скидка", "Топ"];

type StoreData = {
  id: string;
  name: string;
  slug: string;
  instagram: string | null;
  isVerified?: boolean;
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
  banners = [],
}: {
  stores: StoreData[];
  products: ProductData[];
  reports?: ReportData[];
  banners?: BannerItem[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "stores" | "reports" | "banners">("products");
  const [reportsFilter, setReportsFilter] = useState<"pending" | "all" | "resolved" | "dismissed">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Состояние магазинов
  const [storesList, setStoresList] = useState<StoreData[]>(stores);

  // Состояние управления баннерами
  const [bannersList, setBannersList] = useState<BannerItem[]>(banners);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSub, setFormSub] = useState("");
  const [formLabel, setFormLabel] = useState("Реклама");
  const [formCta, setFormCta] = useState("Подробнее");
  const [formHref, setFormHref] = useState("/");
  const [formBg, setFormBg] = useState("from-rose-600 to-rose-800");
  const [formEmoji, setFormEmoji] = useState("✨");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setFormTitle("");
    setFormSub("");
    setFormLabel("Реклама");
    setFormCta("Подробнее");
    setFormHref("/");
    setFormBg("from-rose-600 to-rose-800");
    setFormEmoji("✨");
    setFormImageUrl("");
    setFormIsActive(true);
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormSub(b.sub || "");
    setFormLabel(b.label || "");
    setFormCta(b.cta || "Подробнее");
    setFormHref(b.href || "/");
    setFormBg(b.bg || "from-rose-600 to-rose-800");
    setFormEmoji(b.emoji || "✨");
    setFormImageUrl(b.imageUrl || "");
    setFormIsActive(b.isActive);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Укажите заголовок баннера");
      return;
    }
    setIsSavingBanner(true);
    try {
      const payload = {
        title: formTitle,
        sub: formSub,
        label: formLabel,
        cta: formCta,
        href: formHref,
        bg: formBg,
        emoji: formEmoji,
        imageUrl: formImageUrl,
        isActive: formIsActive,
      };

      if (editingBanner) {
        await updateBannerAdmin(editingBanner.id, payload);
        setBannersList((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? { ...b, ...payload } : b))
        );
        toast.success("Баннер обновлен");
      } else {
        const created = await createBannerAdmin(payload);
        setBannersList((prev) => [...prev, created as BannerItem]);
        toast.success("Баннер создан");
      }
      setIsBannerModalOpen(false);
    } catch {
      toast.error("Ошибка сохранения баннера");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleToggleBanner = async (banner: BannerItem) => {
    const nextState = !banner.isActive;
    setBannersList((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextState } : b))
    );
    try {
      await toggleBannerActiveAdmin(banner.id, nextState);
      toast.success(nextState ? "Баннер включен" : "Баннер скрыт");
    } catch {
      setBannersList((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b))
      );
      toast.error("Ошибка переключения статуса");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот баннер?")) return;
    setBannersList((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBannerAdmin(id);
      toast.success("Баннер удален");
    } catch {
      toast.error("Ошибка удаления баннера");
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

  const handleToggleStoreVerified = async (store: StoreData) => {
    const nextState = !store.isVerified;
    setStoresList((prev) =>
      prev.map((s) => (s.id === store.id ? { ...s, isVerified: nextState } : s))
    );
    try {
      await toggleStoreVerifiedAdmin(store.id, nextState);
      toast.success(nextState ? `Магазин «${store.name}» верифицирован!` : `Верификация магазина «${store.name}» снята`);
    } catch {
      setStoresList((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, isVerified: store.isVerified } : s))
      );
      toast.error("Ошибка изменения статуса верификации");
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm("ВНИМАНИЕ! Это удалит магазин и все его товары навсегда. Продолжить?")) return;
    setLoadingId(id);
    try {
      await deleteStoreAdmin(id);
      setStoresList((prev) => prev.filter((s) => s.id !== id));
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
          <Store className="h-4 w-4" /> Магазины ({storesList.length})
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
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === "banners" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Megaphone className="h-4 w-4 text-rose-500" />
          <span>Баннеры ({bannersList.length})</span>
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
                  <th className="px-4 py-3 font-semibold text-center">Верификация</th>
                  <th className="px-4 py-3 font-semibold text-center">Товаров</th>
                  <th className="px-4 py-3 font-semibold">Регистрация</th>
                  <th className="px-4 py-3 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storesList.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-gray-900">
                        <span>{s.name}</span>
                        {s.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <div className="text-xs text-gray-400">/{s.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">
                      {s.instagram ? `@${s.instagram.replace("@", "")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStoreVerified(s)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all shadow-xs ${
                          s.isVerified
                            ? "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                        }`}
                        title={s.isVerified ? "Нажмите, чтобы снять статус проверенного магазина" : "Нажмите, чтобы сделать магазин проверенным"}
                      >
                        <BadgeCheck className={`h-4 w-4 ${s.isVerified ? "fill-sky-500 text-white" : "text-gray-400"}`} />
                        <span>{s.isVerified ? "Проверен" : "Обычный"}</span>
                      </button>
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

      {/* ── Секция управления баннерами ── */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm outline outline-1 outline-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Рекламные промо-баннеры ({bannersList.length})
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Слайды карусели на главной странице. Изменения применяются мгновенно без повторного деплоя.
              </p>
            </div>
            <button
              onClick={handleOpenCreateBanner}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" /> Добавить баннер
            </button>
          </div>

          {bannersList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-base font-semibold text-gray-900">Нет баннеров в базе данных</h3>
              <p className="mt-1 text-sm text-gray-500">
                Создайте первый промо-баннер для продвижения магазина или товара.
              </p>
              <button
                onClick={handleOpenCreateBanner}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" /> Создать баннер
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {bannersList.map((banner) => (
                <div
                  key={banner.id}
                  className={`flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm outline outline-1 transition-all ${
                    banner.isActive ? "outline-gray-200 hover:shadow-md" : "outline-gray-200/60 bg-gray-50/50 opacity-75"
                  }`}
                >
                  {/* Живой превью баннера */}
                  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${banner.bg} p-5 text-white shadow-md mb-4`}>
                    {banner.imageUrl && (
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1 pr-3 min-w-0">
                        {banner.label && (
                          <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                            {banner.label}
                          </span>
                        )}
                        <h4 className="font-extrabold text-base leading-tight truncate">
                          {banner.title}
                        </h4>
                        {banner.sub && (
                          <p className="mt-1 text-xs text-white/85 line-clamp-2">
                            {banner.sub}
                          </p>
                        )}
                        <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-900 shadow">
                          {banner.cta || "Подробнее"} →
                        </div>
                      </div>
                      {banner.emoji && (
                        <div className="text-4xl select-none flex-shrink-0">
                          {banner.emoji}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Мета-информация и действия */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 truncate max-w-[240px]">
                        <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate font-mono">{banner.href || "/"}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        banner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {banner.isActive ? "Активен на сайте" : "Отключен"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleToggleBanner(banner)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          banner.isActive
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {banner.isActive ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Выключить
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Включить
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditBanner(banner)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Удалить баннер"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Модальное окно создания / редактирования баннера ── */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBanner ? "Редактирование баннера" : "Создание нового баннера"}
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="mt-4 space-y-4">
              {/* Живое интерактивное превью в модалке */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Превью баннера на сайте:
                </label>
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${formBg} p-5 text-white shadow-md`}>
                  {formImageUrl && (
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                      <Image src={formImageUrl} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1 pr-3 min-w-0">
                      {formLabel && (
                        <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
                          {formLabel}
                        </span>
                      )}
                      <h4 className="font-extrabold text-base leading-tight truncate">
                        {formTitle || "Заголовок баннера"}
                      </h4>
                      {formSub && (
                        <p className="mt-1 text-xs text-white/85 line-clamp-2">
                          {formSub}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-900 shadow">
                        {formCta || "Подробнее"} →
                      </div>
                    </div>
                    {formEmoji && (
                      <div className="text-4xl select-none flex-shrink-0">
                        {formEmoji}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Заголовок */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Заголовок баннера *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Скидки до 40% на кроссовки"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Подзаголовок / описание */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Подзаголовок / Описание
                </label>
                <input
                  type="text"
                  placeholder="Например: Новая коллекция с быстрой доставкой по Приднестровью"
                  value={formSub}
                  onChange={(e) => setFormSub(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Бейдж и Текст кнопки */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Бейдж (метка)
                  </label>
                  <input
                    type="text"
                    placeholder="Реклама / Акция / Партнёр"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {LABEL_PRESETS.map((lp) => (
                      <button
                        type="button"
                        key={lp}
                        onClick={() => setFormLabel(lp)}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium border transition ${
                          formLabel === lp ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {lp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Текст кнопки CTA
                  </label>
                  <input
                    type="text"
                    placeholder="Подробнее / В магазин"
                    value={formCta}
                    onChange={(e) => setFormCta(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ссылка перехода */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ссылка для перехода (URL или внутренний путь)
                </label>
                <input
                  type="text"
                  placeholder="/shop/username или /login или /?discount=true"
                  value={formHref}
                  onChange={(e) => setFormHref(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>

              {/* Выбор цвета градиента */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Цветовой градиент
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {GRADIENT_PRESETS.map((gp) => (
                    <button
                      type="button"
                      key={gp.value}
                      onClick={() => setFormBg(gp.value)}
                      className={`h-9 rounded-xl bg-gradient-to-r ${gp.value} border-2 transition ${
                        formBg === gp.value ? "border-gray-900 scale-105 shadow-md" : "border-transparent opacity-85 hover:opacity-100"
                      }`}
                      title={gp.label}
                    />
                  ))}
                </div>
              </div>

              {/* Эмодзи-иконка */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Эмодзи-иконка
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="✨"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-16 text-center text-xl rounded-xl border border-gray-200 py-1.5 text-gray-900 focus:border-rose-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_PRESETS.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setFormEmoji(em)}
                        className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center border transition ${
                          formEmoji === em ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Чекбокс активности */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="formIsActive" className="text-sm font-medium text-gray-700 select-none">
                  Баннер активен и отображается в карусели на главной
                </label>
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isSavingBanner ? "Сохранение..." : editingBanner ? "Сохранить изменения" : "Создать баннер"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
