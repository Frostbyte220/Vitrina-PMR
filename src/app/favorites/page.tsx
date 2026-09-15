"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { ProductCard } from "@/components/product/ProductCard";
import { getFavoriteProducts } from "@/actions/favorites";

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ждем монтирования компонента на клиенте, чтобы прочитать localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Как только появились ID или компонент загрузился — идем в базу за товарами
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      if (favorites.length > 0) {
        const data = await getFavoriteProducts(favorites);
        setProducts(data);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    };

    if (mounted) {
      loadProducts();
    }
  }, [favorites, mounted]);

  // Чтобы не было прыжков верстки до загрузки клиента
  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Шапка страницы */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Избранное</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {favorites.length} {favorites.length === 1 ? "товар" : 
              favorites.length > 1 && favorites.length < 5 ? "товара" : "товаров"}
          </p>
        </div>
      </div>

      {/* Состояния: Загрузка / Список товаров / Пусто */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 py-24 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Список желаний пуст</h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500 leading-relaxed">
            Вы пока ничего не добавили в избранное. Кликайте на сердечко у понравившихся товаров, чтобы не потерять их.
          </p>
          <Link
            href="/"
            className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-md active:scale-95"
          >
            Перейти в каталог
          </Link>
        </div>
      )}
    </div>
  );
}