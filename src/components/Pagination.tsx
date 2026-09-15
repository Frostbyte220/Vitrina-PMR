"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Функция для смены страницы с плавным скроллом
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    
    // Формируем точный путь и пушим его без встроенного резкого прыжка Next.js
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Запускаем нативный плавный скролл браузера к началу страницы
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Номер страницы */}
      <span className="text-sm font-medium text-gray-700">
        Страница {currentPage} из {totalPages}
      </span>

      {/* Кнопка "Вперед" */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}