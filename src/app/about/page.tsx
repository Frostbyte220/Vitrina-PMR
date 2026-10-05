import type { Metadata } from "next";
import { Store, Lightbulb, HeartHandshake, MapPin, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";

export const metadata: Metadata = {
  title: "О проекте | Витрина ПМР — Магазины Тирасполя и Приднестровья",
  description:
    "Vitrina PMR — единая витрина локальных магазинов Приднестровья. Купить одежду, обувь, косметику и электронику в Тирасполе и Бендерах. Бесплатное размещение для продавцов ПМР.",
  keywords: [
    "витрина ПМР",
    "магазины Тирасполя",
    "купить в Приднестровье",
    "магазины ПМР",
    "интернет магазин Тирасполь",
    "купить Тирасполь",
    "шопинг ПМР",
    "местные магазины Приднестровья",
  ],
  openGraph: {
    title: "Витрина ПМР — Магазины Тирасполя и Приднестровья",
    description:
      "Единый каталог товаров из локальных магазинов Приднестровья. Одежда, обувь, косметика, электроника — всё в одном месте.",
    siteName: "Vitrina PMR",
    locale: "ru_RU",
    type: "website",
  },
};

// JSON-LD разметка для Google — помогает поисковику понять, что это локальный бизнес
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vitrina PMR",
  description:
    "Единая витрина локальных магазинов Приднестровья. Купить товары во всех городах ПМР.",
  url: "https://vitrina-pmr.vercel.app",
  areaServed: {
    "@type": "Place",
    name: "Приднестровская Молдавская Республика",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "vitrinapmr@mail.ru",
    contactType: "customer support",
  },
};
import { BackButton } from "@/components/ui/BackButton";

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <BackButton />
          </div>
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              О проекте <span className="text-rose-600">Vitrina PMR</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Единая витрина ПМР — собираем локальные магазины Тирасполя и Приднестровья в одном месте.
            </p>
          </div>

          {/* Основной контент */}
          <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm outline outline-1 outline-gray-200 sm:p-10">

            {/* Блок: Что такое Vitrina PMR */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Store className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Что такое Витрина ПМР?</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                <strong>Vitrina PMR</strong> — это бесплатный онлайн-каталог товаров из локальных
                Instagram-магазинов Приднестровья. Мы собрали в одном месте магазины со
                всей республики, чтобы вам не приходилось тратить часы на поиск нужного товара
                по десяткам разрозненных аккаунтов.
                <br /><br />
                Здесь можно купить <strong>одежду, обувь, косметику, парфюмерию, детские товары,
                электронику и handmade изделия</strong> от местных продавцов с доставкой по ПМР
                или самовывозом во всех 8 городах республики. Все покупки совершаются напрямую с продавцом
                в Instagram или Telegram — без посредников и скрытых комиссий.
              </p>
            </section>

            <hr className="border-gray-100" />

            {/* Блок: Статистика / цифры */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Витрина ПМР в цифрах</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-rose-50 p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <ShoppingBag className="h-7 w-7 text-rose-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-rose-700">12</p>
                  <p className="text-sm text-gray-500 mt-1">Категорий товаров</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <MapPin className="h-7 w-7 text-blue-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-blue-700">8</p>
                  <p className="text-sm text-gray-500 mt-1">Городов ПМР</p>
                </div>
                <div className="rounded-xl bg-green-50 p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-green-700">0 р</p>
                  <p className="text-sm text-gray-500 mt-1">Комиссия для продавцов</p>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Блок: Для продавцов */}
            <section className="rounded-xl bg-gray-50 p-6 outline outline-1 outline-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Вы продавец из ПМР?</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Разместите свои товары на Витрине ПМР абсолютно <strong>бесплатно</strong> и
                получите дополнительный канал продаж. Ваш магазин увидят тысячи покупателей
                со всех городов Приднестровья, которые ищут товары прямо сейчас.
                Покупатели будут писать вам напрямую в Instagram — никаких комиссий, никаких
                посредников.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              >
                <Store className="h-4 w-4" />
                Разместить магазин бесплатно
              </Link>
            </section>

            <hr className="border-gray-100" />

            {/* Блок: Контакт */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Сотрудничество и обратная связь</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Проект активно развивается и мы открыты к диалогу! Если вы хотите стать партнером
                платформы, столкнулись с ошибкой или у вас есть идея нового функционала —
                обязательно напишите нам. Мы внимательно читаем все пожелания.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-gray-50 p-6 outline outline-1 outline-gray-200">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900">Напишите нам на почту:</h3>
                  <a
                    href="mailto:vitrinapmr@mail.ru"
                    className="mt-1 inline-block text-lg font-medium text-rose-600 transition-colors hover:text-rose-700"
                  >
                    vitrinapmr@mail.ru
                  </a>
                </div>
                <CopyEmailButton email="vitrinapmr@mail.ru" />
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  );
}
