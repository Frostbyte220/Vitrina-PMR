"use client";

import Image from "next/image";
import { Tag } from "lucide-react";

// Описываем, какие данные будет принимать карточка (соответствует вашей модели Prisma)
interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    category: string;
    image: string;
    description?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-md">
      {/* Блок с картинкой */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Бейдж категории */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
          <Tag className="h-3 w-3" />
          {product.category}
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="flex flex-col flex-grow p-4">
        <h4 className="line-clamp-1 text-lg font-semibold text-gray-800">
          {product.title}
        </h4>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-black">
            {product.price} руб.
          </span>
          {/* Место под будущую кнопку удаления */}
        </div>
      </div>
    </div>
  );
}