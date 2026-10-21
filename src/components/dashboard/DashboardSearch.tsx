"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function DashboardSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    
    // При новом поиске всегда сбрасываем пагинацию на первую страницу
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по вашим товарам..."
        className="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6 transition-all"
      />
      {/* Кнопка для submit формы, чтобы срабатывало и по Enter */}
      <button type="submit" className="hidden">Найти</button>
    </form>
  );
}
