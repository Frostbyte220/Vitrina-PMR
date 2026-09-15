"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Package, ImageOff, Edit } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/app/dashboard/actions";
import type { Product } from "@/types";

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images?.[0];
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите безвозвратно удалить этот товар?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteProduct(product.id);

      if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Произошла системная ошибка. Проверьте подключение к интернету.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем конфликты, если карточка станет кликабельной
    router.push(`/dashboard/edit/${product.id}`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title || "Товар"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <ImageOff className="h-10 w-10 text-gray-400 opacity-30" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.category && (
            <span className="rounded-md bg-[#e31837] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {product.category}
            </span>
          )}
          {product.subCategory && (
            <span className="rounded-md border border-gray-200 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur-sm">
              {product.subCategory}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-4 text-left">
        <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-1" title={product.title}>
          {product.title}
        </h3>

        {product.description ? (
          <p className="mb-3 flex-grow text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        ) : (
          <div className="mb-3 flex-grow"></div>
        )}

        <div className="mt-auto flex items-end justify-between">
          <span className="text-xl font-black text-[#7a0026]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-3">
        <button
          onClick={handleEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
        >
          <Edit className="h-4 w-4" />
          Изменить
        </button>

        <div className="h-4 w-px bg-gray-300"></div>

        <div className="flex-1">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGridClient({ items, searchQuery }: { items: Product[]; searchQuery: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/50 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <Package className="h-8 w-8 text-text-muted opacity-60" />
        </div>
        <h3 className="text-lg font-semibold text-text-main">
          {searchQuery ? "Ничего не найдено" : "Витрина пуста"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-text-muted">
          {searchQuery
            ? `По запросу «${searchQuery}» нет совпадений. Попробуйте изменить запрос.`
            : "У вас пока нет добавленных товаров. Нажмите кнопку «Добавить товар», чтобы создать свою первую карточку."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}