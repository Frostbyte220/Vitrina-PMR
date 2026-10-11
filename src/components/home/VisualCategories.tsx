"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Shirt, 
  Footprints, 
  Sparkles, 
  Droplet, 
  Baby, 
  Palette, 
  Smartphone,
  Watch,
  Home,
  Dumbbell,
  Gift,
  Grid
} from "lucide-react";

const categoryMap = [
  { name: "Одежда", icon: Shirt, color: "bg-blue-100 text-blue-600" },
  { name: "Обувь", icon: Footprints, color: "bg-orange-100 text-orange-600" },
  { name: "Косметика", icon: Sparkles, color: "bg-pink-100 text-pink-600" },
  { name: "Парфюмерия", icon: Droplet, color: "bg-purple-100 text-purple-600" },
  { name: "Детские товары", icon: Baby, color: "bg-yellow-100 text-yellow-600" },
  { name: "Handmade", icon: Palette, color: "bg-teal-100 text-teal-600" },
  { name: "Электроника", icon: Smartphone, color: "bg-gray-100 text-gray-700" },
  { name: "Аксессуары", icon: Watch, color: "bg-red-100 text-red-600" },
  { name: "Для дома", icon: Home, color: "bg-emerald-100 text-emerald-600" },
  { name: "Спорт и отдых", icon: Dumbbell, color: "bg-indigo-100 text-indigo-600" },
  { name: "Подарки", icon: Gift, color: "bg-rose-100 text-rose-600" },
  { name: "Разное", icon: Grid, color: "bg-slate-100 text-slate-600" },
];

export function VisualCategories() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex space-x-4 overflow-x-auto py-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-4 md:space-x-0">
        {categoryMap.map((cat) => {
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
              className={`flex min-w-[72px] flex-col items-center gap-2 p-1 transition-transform hover:scale-105 snap-start ${
                isActive ? "scale-105" : ""
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${cat.color} shadow-sm transition-all ${
                  isActive ? "ring-2 ring-rose-500 shadow-md ring-offset-1" : ""
                }`}
              >
                <cat.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span
                className={`text-center text-[11px] font-medium leading-tight md:text-xs ${
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
