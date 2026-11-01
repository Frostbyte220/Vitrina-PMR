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
        a: "Используйте строку умного поиска вверху страницы — введите название товара, бренда или категорию. Вы можете фильтровать каталог по городам ПМР, категориям (Одежда, Обувь, Косметика и др.), диапазону цен и наличию размеров.",
      },
      {
        q: "Как купить товар и оформить заказ?",
        a: "На сайте есть два удобных способа покупки без комиссий и наценок:\n\n1. Через корзину (мульти-заказ): выберите подходящий размер, нажмите «В корзину», перейдите в корзину и нажмите «Оформить заказ». Сервис автоматически сформирует готовое сообщение со списком товаров, размерами, ценами и ссылками для отправки в Telegram или Viber продавца.\n\n2. Напрямую из карточки: нажмите кнопку «Написать» на странице любого товара и выберите удобный мессенджер (Telegram, Viber, Instagram Direct или звонок).\n\nОплата и получение товара происходят напрямую между вами и магазином.",
      },
      {
        q: "В какой валюте указаны цены и как устроена доставка?",
        a: "Все цены на E-Vitrina PMR указаны в рублях Приднестровья (руб. ПМР).\n\nСпособы доставки определяет каждый магазин самостоятельно: большинство продавцов предлагают самовывоз из своего шоурума или физического магазина (в Тирасполе, Бендерах и др.), курьерскую доставку до двери либо отправку Экспресс-почтой ПМР в любой населенный пункт республики.",
      },
      {
        q: "Безопасно ли покупать у продавцов с сайта?",
        a: "Мы модерируем витрины перед публикацией и проверяем наличие реальных контактов продавцов. В карточке магазина указаны его социальные сети, физический адрес или города работы. Оплата согласовывается напрямую: наличными при получении либо быстрым переводом на карту «Клевер» / «Агропромбанк».",
      },
      {
        q: "Можно ли заказать товары сразу из нескольких магазинов?",
        a: "Да! Вы можете положить в корзину товары от разных продавцов. В корзине они аккуратно сгруппируются по магазинам, и вы сможете оформить каждый заказ отдельно в один клик в соответствующий мессенджер.",
      },
    ],
  },
  {
    category: "Для продавцов",
    icon: Store,
    color: "bg-rose-100 text-rose-600",
    questions: [
      {
        q: "Как добавить свой магазин на витрину?",
        a: "Всё просто и занимает 2 минуты:\n1. Нажмите «Разместить магазин» или «Войти» → зарегистрируйтесь\n2. В настройках профиля укажите название магазина, города, контакты (Telegram, Viber, Instagram, телефон) и загрузите логотип\n3. В разделе «Мои товары» добавьте первые позиции с фото, ценами и размерами\n\nВаша витрина сразу станет доступна по персональной ссылке e-vitrina.com/shop/[ваш_магазин].",
      },
      {
        q: "Это платно? Есть ли комиссия с продаж?",
        a: "Нет. Регистрация витрины, размещение товаров и нахождение в каталоге абсолютно бесплатны. Мы не берем процент со сделок — все 100% выручки остаются у вас.",
      },
      {
        q: "Сколько товаров можно добавить?",
        a: "Ограничений по количеству товаров нет. Добавляйте весь актуальный ассортимент — чем больше товаров, тем чаще покупатели будут находить ваш магазин в поиске.",
      },
      {
        q: "Как покупатели будут присылать заказы?",
        a: "Покупатели отправляют заказы напрямую в ваши мессенджеры (Telegram, Viber или Instagram). Сообщения приходят уже в структурированном виде: с названием товара, выбранным размером, актуальной ценой и прямой ссылкой на позицию.",
      },
      {
        q: "Можно ли быстро редактировать, дублировать или скрывать товары?",
        a: "Да. В личном кабинете продавца доступны быстрое редактирование, скрытие проданных позиций в 1 клик, дублирование похожих товаров («Создать копию») и экспорт каталога в Excel/CSV.",
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
        a: "На платформе представлены продавцы из всех 8 городов Приднестровья: Тирасполь, Бендеры, Рыбница, Дубоссары, Григориополь, Слободзея, Каменка, Днестровск. Покупатели могут в один клик отфильтровать витрины своего города.",
      },
      {
        q: "Как сообщить о проблеме или предложить сотрудничество?",
        a: "Напишите нам на официальную электронную почту e-vitrinapmr@mail.ru или в Instagram @evitrinapmr (https://www.instagram.com/evitrinapmr/). Мы открыты к предложениям и помогаем каждому локальному продавцу.",
      },
      {
        q: "Могу ли я порекомендовать магазин, которого еще нет на сайте?",
        a: "Конечно! Напишите нам ник Instagram или контакты классного местного магазина на e-vitrinapmr@mail.ru, и мы поможем ему бесплатно оформить витрину на платформе.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-rose-600"
      >
        <span className="font-semibold text-gray-900">{q}</span>
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
    <main className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Частые вопросы
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500">
            Ответы на самые популярные вопросы покупателей и продавцов на E-Vitrina PMR.
          </p>
        </div>

        <div className="space-y-6">
          {FAQS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.category}
                className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.color}`}>
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
        <div className="mt-8 rounded-2xl bg-rose-50/70 p-8 text-center border border-rose-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Остались вопросы?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Напишите нам — ответим и поможем с любым вопросом.
          </p>
          <a
            href="mailto:e-vitrinapmr@mail.ru"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 shadow-xs"
          >
            e-vitrinapmr@mail.ru
          </a>
        </div>

        {/* Ссылка на регистрацию */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Хотите разместить свой магазин?{" "}
            <Link href="/login" className="font-semibold text-rose-600 hover:underline">
              Регистрация бесплатна →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}