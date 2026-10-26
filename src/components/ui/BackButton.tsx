"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      Назад
    </button>
  );
}
