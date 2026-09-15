"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit, X } from "lucide-react";
import { updateProduct } from "@/app/dashboard/actions";
import type { Product } from "@/types";

export default function EditProductButton({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Убеждаемся, что компонент смонтирован на клиенте (нужно для createPortal в Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateAction = updateProduct.bind(null, product.id);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await updateAction(formData);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Редактировать"
        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-primary z-10"
      >
        <Edit className="h-4 w-4" />
      </button>

      {/* Рендерим модальное окно через Portal прямо в body */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <form
              action={handleSubmit}
              className="flex flex-col gap-4 w-full mt-2"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Редактировать товар
              </h3>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`title-${product.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Название товара
                </label>
                <input
                  type="text"
                  id={`title-${product.id}`}
                  name="title"
                  defaultValue={product.title}
                  required
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`price-${product.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Цена (₽)
                </label>
                <input
                  type="number"
                  id={`price-${product.id}`}
                  name="price"
                  defaultValue={product.price}
                  required
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`category-${product.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Категория
                </label>
                <input
                  type="text"
                  id={`category-${product.id}`}
                  name="category"
                  defaultValue={product.category || ""}
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`image-${product.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Ссылка на фото
                </label>
                <input
                  type="url"
                  id={`image-${product.id}`}
                  name="image"
                  defaultValue={product.images?.[0] || ""}
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`desc-${product.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Описание
                </label>
                <textarea
                  id={`desc-${product.id}`}
                  name="description"
                  rows={3}
                  defaultValue={product.description || ""}
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full resize-none"
                  placeholder="Напишите подробнее о товаре..."
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-4 bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}