"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { Store, ShoppingBag, HelpCircle } from "lucide-react";

const FAQS = [
  {
    category: "Для покупателей",
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-600",
    questions: [
      {
        q: "Как найти нужный товар?",
        a: "Используйте строку поиска вверху страницы — введите название товара, бренда или категорию. Можно дополнительно фильтровать по категории (Одежда, Обувь, Косметика и т.д.) и сортировать результаты по цене.",
      },
      {
        q: "Как покупатели находят магазины на Витрине?",
        a: "Через поиск Google и Яндекс, по прямым ссылкам от продавцов, а также через каталог на сайте. Покупатель вводит, например, «купить кроссовки Тирасполь» — и попадает на карточку товара на нашем сайте.",
      },
      {
        q: "Как купить товар?",
        a: "На Витрине ПМР нельзя купить товар напрямую — это каталог, а не интернет-магазин с корзиной. Нажмите кнопку «Написать продавцу» на странице товара, и ваш браузер откроет Instagram-чат с продавцом. Цену, доставку и оплату вы обсуждаете с ним напрямую.",
      },
      {
        q: "Безопасно ли покупать у продавцов с сайта?",
        a: "Мы проверяем каждый магазин перед публикацией — требуем реальный Instagram-аккаунт с активностью. Но так как оплата происходит напрямую между вами и продавцом, рекомендуем смотреть отзывы в Instagram-профиле магазина и не переводить деньги незнакомым аккаунтам без проверки.",
      },
      {
        q: "Есть ли доставка?",
        a: "Условия доставки определяет каждый продавец самостоятельно. Большинство предлагают самовывоз или доставку по городу. Уточняйте у продавца в личных сообщениях.",
      },
    ],
  },
  {
    category: "Для продавцов",
    icon: Store,
    color: "bg-rose-100 text-rose-600",
    questions: [
      {
        q: "Как добавить свой магазин на сайт?",
        a: "Всё просто:\n1. Нажмите «Войти» → «Зарегистрировать магазин»\n2. Укажите email, пароль и название магазина\n3. В личном кабинете заполните профиль: логотип, описание, город, Instagram\n4. Нажмите «Добавить товар» и загрузите первые позиции\n\nМодерация занимает до 24 часов — после одобрения ваш магазин появится на сайте.",
      },
      {
        q: "Это платно?",
        a: "Нет. Регистрация магазина, добавление товаров и нахождение на сайте — абсолютно бесплатны. Мы не берём комиссию с продаж.",
      },
      {
        q: "Сколько товаров можно добавить?",
        a: "На данный момент ограничений по количеству товаров нет. Добавляйте столько, сколько нужно.",
      },
      {
        q: "Как добавить товар?",
        a: "В личном кабинете нажмите кнопку «Добавить товар». Заполните название, цену, категорию и загрузите до 5 фотографий. Товар появится на сайте после одобрения модератором (обычно в течение нескольких часов).",
      },
      {
        q: "Как покупатели свяжутся со мной?",
        a: "При добавлении магазина вы указываете свой Instagram. Кнопка «Написать продавцу» на странице товара откроет ваш Instagram-чат у покупателя. Никакие личные данные покупателя нам не передаются — всё общение напрямую.",
      },
      {
        q: "Можно ли редактировать или удалять товары?",
        a: "Да. В личном кабинете (раздел «Мои товары») вы можете в любой момент редактировать описание, цену и фото, а также скрыть или удалить товар.",
      },
      {
        q: "Что делать, если товар закончился?",
        a: "Переведите товар в статус «Неактивен» в личном кабинете. Он пропадёт из каталога, но сохранится в вашем профиле — сможете снова активировать, когда товар появится.",
      },
    ],
  },
  {
    category: "Общие вопросы",
    icon: HelpCircle,
    color: "bg-gray-100 text-gray-600",
    questions: [
      {
        q: "В каких городах работает E-Vitrina PMR?",
        a: "На сайте представлены продавцы из всех городов Приднестровья: Тирасполь, Бендеры, Рыбница, Дубоссары, Григориополь, Слободзея, Каменка, Днестровск.",
      },
      {
        q: "Как сообщить о проблеме или предложить идею?",
        a: "Напишите нам на почту vitrinapmr@mail.ru или в Instagram @vitrinapmr. Мы читаем все сообщения и стараемся отвечать в течение суток.",
      },
      {
        q: "Я не продавец, могу ли я предложить добавить магазин?",
        a: "Конечно! Если вы знаете классный местный магазин в Instagram — напишите нам название аккаунта на vitrinapmr@mail.ru. Мы свяжемся с продавцом и пригласим его на платформу.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="pb-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Частые вопросы
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Ответы на самые популярные вопросы покупателей и продавцов.
          </p>
        </div>

        <div className="space-y-6">
          {FAQS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.category}
                className="rounded-2xl bg-white p-6 shadow-sm outline outline-1 outline-gray-200 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${section.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
                </div>
                <div>
                  {section.questions.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Остались вопросы */}
        <div className="mt-8 rounded-2xl bg-rose-50 p-8 text-center outline outline-1 outline-rose-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Остались вопросы?</h2>
          <p className="text-gray-600 mb-4">
            Напишите нам — ответим в течение суток.
          </p>
          <a
            href="mailto:vitrinapmr@mail.ru"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            vitrinapmr@mail.ru
          </a>
        </div>

        {/* Ссылка на регистрацию */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Хотите разместить свой магазин?{" "}
            <Link href="/login" className="font-medium text-rose-600 hover:underline">
              Регистрация бесплатна →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
