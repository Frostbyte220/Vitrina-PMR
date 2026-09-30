"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600 font-medium"
      aria-label="Вернуться назад"
    >
      <ArrowLeft className="h-5 w-5" />
      Вернуться назад
    </button>
  );
}
