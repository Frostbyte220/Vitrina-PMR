"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  ImageOff,
  Edit,
  EyeOff,
  Eye,
  Package,
  CheckSquare,
  Copy,
  Download,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  deleteProduct,
  toggleProductStatus,
  duplicateProduct,
  bulkUpdateProductsStatus,
  bulkDeleteProducts,
} from "@/app/dashboard/actions";
import type { Product } from "@/types";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import AddProductButton from "@/components/AddProductButton";
import toast from "react-hot-toast";

interface ProductsTableClientProps {
  items: Product[];
  searchQuery: string;
}

export function ProductsTableClient({ items, searchQuery }: ProductsTableClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // ── Bulk selection state ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((p) => p.id)));
    }
  }, [allSelected, items]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Single-item actions ───────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Вы уверены, что хотите удалить этот товар? (Он будет перемещен в удаленные)"
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      if (result?.error) alert(result.error);
    } catch {
      alert("Ошибка при удалении");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    try {
      const result = await toggleProductStatus(id, currentStatus);
      if (result?.error) alert(result.error);
    } catch {
      alert("Ошибка при обновлении статуса");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const result = await duplicateProduct(id);
      if (result.success) {
        toast.success("Копия товара создана (со статусом «Скрыт»)");
      } else {
        toast.error(result.error ?? "Не удалось создать копию товара");
      }
    } catch {
      toast.error("Ошибка при дублировании товара");
    } finally {
      setDuplicatingId(null);
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error("Нет товаров для экспорта");
      return;
    }

    try {
      // Заголовки таблицы
      const headers = [
        "ID",
        "Название",
        "Категория",
        "Подкатегория",
        "Цена (руб)",
        "Старая цена (руб)",
        "Статус",
        "Размеры",
        "Фотографии",
      ];

      const escapeCSV = (val: string | number | null | undefined) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = items.map((p) => [
        escapeCSV(p.id),
        escapeCSV(p.title),
        escapeCSV(p.category),
        escapeCSV(p.subCategory || ""),
        escapeCSV(p.price),
        escapeCSV(p.oldPrice || ""),
        escapeCSV(p.status || "Активен"),
        escapeCSV(Array.isArray(p.sizes) ? p.sizes.join(", ") : ""),
        escapeCSV(Array.isArray(p.images) ? p.images.join("; ") : ""),
      ]);

      // Добавляем UTF-8 BOM (\uFEFF) для корректного открытия кириллицы в Excel на Windows
      const csvContent =
        "\uFEFF" +
        [headers.map((h) => `"${h}"`).join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `vitrina-pmr-products-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Экспортировано ${items.length} товаров в CSV`);
    } catch (err) {
      console.error("Ошибка при экспорте CSV:", err);
      toast.error("Не удалось экспортировать CSV");
    }
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkPublish = async () => {
    setIsBulkLoading(true);
    try {
      const result = await bulkUpdateProductsStatus([...selectedIds], "Активен");
      if (result.success) {
        toast.success(`Опубликовано товаров: ${result.count}`);
        setSelectedIds(new Set());
      } else {
        toast.error(result.error ?? "Ошибка при публикации");
      }
    } catch {
      toast.error("Ошибка при публикации");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkHide = async () => {
    setIsBulkLoading(true);
    try {
      const result = await bulkUpdateProductsStatus([...selectedIds], "Скрыт");
      if (result.success) {
        toast.success(`Скрыто товаров: ${result.count}`);
        setSelectedIds(new Set());
      } else {
        toast.error(result.error ?? "Ошибка при скрытии");
      }
    } catch {
      toast.error("Ошибка при скрытии");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Удалить ${selectedIds.size} товаров? Они будут перемещены в удалённые.`
      )
    ) {
      return;
    }
    setIsBulkLoading(true);
    try {
      const result = await bulkDeleteProducts([...selectedIds]);
      if (result.success) {
        toast.success(`Удалено товаров: ${result.count}`);
        setSelectedIds(new Set());
      } else {
        toast.error(result.error ?? "Ошибка при удалении");
      }
    } catch {
      toast.error("Ошибка при удалении");
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 w-full sm:max-w-xs">
          <DashboardSearch initialQuery={searchQuery} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Экспорт каталога в CSV (Excel)"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Экспорт CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <AddProductButton />
        </div>
      </div>

      {/* ТАБЛИЦА */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                {/* Checkbox column */}
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    aria-label="Выбрать все"
                  />
                </th>
                <th className="px-6 py-4 font-semibold">Товар</th>
                <th className="px-6 py-4 font-semibold">Категория</th>
                <th className="px-6 py-4 font-semibold">Цена</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length > 0 ? (
                items.map((product) => {
                  const imageUrl = product.images?.[0];
                  const isActive = product.status === "Активен";
                  const isSelected = selectedIds.has(product.id);
                  const isDuplicating = duplicatingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors hover:bg-gray-50/30 ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      {/* Row checkbox */}
                      <td className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(product.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                          aria-label={`Выбрать ${product.title}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1">{product.title}</div>
                            <div className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900">{product.category}</span>
                          {product.subCategory && (
                            <span className="text-xs text-gray-500">{product.subCategory}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${product.oldPrice && product.oldPrice > product.price ? "text-rose-600" : "text-gray-900"}`}
                          >
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.oldPrice)}
                              </span>
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.status || "Активен"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Скрыть / Показать */}
                          <button
                            onClick={() => handleToggleStatus(product.id, product.status || "Активен")}
                            disabled={togglingId === product.id}
                            title={isActive ? "Скрыть товар" : "Показать товар"}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>

                          {/* Создать копию */}
                          <button
                            onClick={() => handleDuplicate(product.id)}
                            disabled={isDuplicating}
                            title="Создать копию товара"
                            className="rounded-lg p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50"
                          >
                            {isDuplicating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>

                          {/* Редактировать */}
                          <Link
                            href={`/dashboard/edit/${product.id}`}
                            className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {/* Удалить */}
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="h-8 w-8 text-gray-300" />
                      <p>Товары не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ПЛАВАЮЩАЯ ПАНЕЛЬ МАССОВЫХ ДЕЙСТВИЙ ─────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-2xl text-white text-sm whitespace-nowrap">
            <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-medium text-gray-300">
              Выбрано: <span className="text-white font-bold">{selectedIds.size}</span>
            </span>
            <div className="h-4 w-px bg-gray-700 shrink-0" />
            <button
              onClick={handleBulkPublish}
              disabled={isBulkLoading}
              className="rounded-lg px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 transition-colors font-medium"
            >
              Опубликовать
            </button>
            <button
              onClick={handleBulkHide}
              disabled={isBulkLoading}
              className="rounded-lg px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
            >
              Скрыть
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
              className="rounded-lg px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors font-medium"
            >
              Удалить
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={isBulkLoading}
              className="ml-1 rounded-lg p-1.5 text-gray-400 hover:text-white transition-colors"
              title="Снять выделение"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
