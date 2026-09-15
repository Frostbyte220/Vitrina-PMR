"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import AddProductForm from "@/app/dashboard/AddProductForm";

export default function AddProductButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        // Ваши классы для идеальной стилизации
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Добавить товар</span>
      </button>

      {/* Модальное окно (рендерится только если isOpen === true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Кнопка-крестик для закрытия */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Передаем функцию закрытия внутрь формы */}
            <AddProductForm onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
