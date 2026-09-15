"use client"; // Добавляем эту строку в самое начало файла!

import Link from "next/link";
import { useRouter } from "next/navigation"; // Импортируем хук роутера
import { PackageX, ArrowLeft, Search } from "lucide-react";
import { ProductPageHeader } from "@/components/layout/ProductPageHeader";

export default function ProductNotFound() {
  const router = useRouter(); // Инициализируем роутер

  return (
    <>
      <ProductPageHeader />
      
      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 border-8 border-gray-100/50">
          <PackageX className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Товар не найден
        </h1>
        <p className="mb-8 max-w-md text-base leading-relaxed text-gray-500">
          К сожалению, этот товар больше недоступен. Возможно, продавец снял его с продажи, удалил, или вы перешли по устаревшей ссылке.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            Искать другие товары
          </Link>
          
          <button
            onClick={() => router.back()} // Используем метод Next.js вместо window
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться назад
          </button>
        </div>
      </main>
    </>
  );
}