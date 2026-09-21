"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ImageOff, Edit, EyeOff, Eye, Search, Plus, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { deleteProduct, toggleProductStatus } from "@/app/dashboard/actions";
import type { Product } from "@/types";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import AddProductButton from "@/components/AddProductButton";

interface ProductsTableClientProps {
  items: Product[];
  searchQuery: string;
}

export function ProductsTableClient({ items, searchQuery }: ProductsTableClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот товар? (Он будет перемещен в удаленные)")) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      if (result?.error) alert(result.error);
    } catch (error) {
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
    } catch (error) {
      alert("Ошибка при обновлении статуса");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 w-full sm:max-w-xs">
          <DashboardSearch initialQuery={searchQuery} />
        </div>
        <div className="flex items-center gap-3">
          <AddProductButton />
        </div>
      </div>

      {/* ТАБЛИЦА */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
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
                  
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50/30">
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
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(product.price)}
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.status || "Активен")}
                            disabled={togglingId === product.id}
                            title={isActive ? "Скрыть товар" : "Показать товар"}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          
                          <Link
                            href={`/dashboard/edit/${product.id}`}
                            className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
    </div>
  );
}
