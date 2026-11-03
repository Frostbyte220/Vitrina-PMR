"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VISUAL_CATEGORIES } from "@/lib/constants/categories";

export function VisualCategories() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex space-x-3 sm:space-x-4 overflow-x-auto py-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-3.5 md:space-x-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.name;
          const params = new URLSearchParams(searchParams.toString());
          if (isActive) {
            params.delete("category");
          } else {
            params.set("category", cat.name);
          }
          params.delete("page");
          params.delete("sub");

          const href = params.toString() ? `/?${params.toString()}` : "/";

          return (
            <Link
              key={cat.name}
              href={href}
              scroll={false}
              className={`flex min-w-[70px] sm:min-w-[76px] flex-col items-center gap-2 p-1 transition-transform hover:scale-105 snap-start ${
                isActive ? "scale-105" : ""
              }`}
            >
              <div
                className={`flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${cat.color} shadow-xs transition-all ${
                  isActive ? "ring-2 ring-rose-500 shadow-md ring-offset-2" : "hover:shadow-sm"
                }`}
              >
                <cat.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span
                className={`text-center text-[11px] font-medium leading-tight md:text-xs max-w-[80px] line-clamp-2 ${
                  isActive ? "font-bold text-rose-700" : "text-gray-700"
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
