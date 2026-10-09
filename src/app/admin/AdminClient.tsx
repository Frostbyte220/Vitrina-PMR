"use client";

import { useState } from "react";
import { Trash2, Store, Package, RefreshCw, AlertTriangle } from "lucide-react";
import { deleteProductAdmin, restoreProductAdmin, deleteStoreAdmin } from "./actions";
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
  store: { name: string } | null;
};

export function AdminClient({
  stores,
  products,
}: {
  stores: StoreData[];
  products: ProductData[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "stores">("products");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
          <Store className="h-4 w-4" /> Магазины ({stores.length})
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
    </div>
  );
}
