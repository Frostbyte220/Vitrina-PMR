import Link from "next/link";
import { Mail, Heart, Store, Info, Home } from "lucide-react";
import { CopyEmailIconButton } from "@/components/ui/CopyEmailIconButton";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {/* Блок 1: О бренде */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-extrabold tracking-tight text-rose-800 transition-opacity hover:opacity-80">
                Vitrina PMR
              </h3>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Единый каталог товаров из Instagram-магазинов Приднестровья.
              Находим, объединяем и делаем онлайн-шопинг удобнее.
            </p>
            <div className="pt-2">
              <CopyEmailIconButton email="vitrinapmr@mail.ru" />
            </div>
          </div>

          {/* Блок 2: Навигация */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Навигация</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600"
                >
                  <Home className="h-4 w-4" />
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600"
                >
                  <Heart className="h-4 w-4" />
                  Избранное
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600"
                >
                  <Info className="h-4 w-4" />О проекте
                </Link>
              </li>
            </ul>
          </div>

          {/* Блок 3: Сотрудничество */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Для бизнеса</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600"
                >
                  <Store className="h-4 w-4" />
                  Вход для продавцов
                </Link>
              </li>
              <li>
                {/* 🔥 Изменили a на Link, а href заменили на /partnership */}
                <Link
                  href="/partnership"
                  className="inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-600"
                >
                  <Mail className="h-4 w-4" />
                  Сотрудничество
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Vitrina PMR. Все права защищены.
          </p>
          <p className="text-sm font-medium text-gray-400">Сделано в ПМР</p>
        </div>
      </div>
    </footer>
  );
}
