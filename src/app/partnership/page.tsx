import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Handshake,
  Store,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Sparkles,
  Users,
} from "lucide-react";
import { CopyEmailIconButton } from "@/components/ui/CopyEmailIconButton";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Сотрудничество для магазинов и брендов | E-Vitrina PMR",
  description:
    "Разместите ваш Instagram-магазин на E-Vitrina PMR бесплатно. Готовая онлайн-витрина с фильтрами, каталог товаров и прямые заказы от покупателей всего Приднестровья.",
};

const BENEFITS = [
  {
    icon: Store,
    title: "Бесплатная витрина за 2 минуты",
    description:
      "Персональная страница e-vitrina.com/shop/[ваш_магазин] со всеми контактами, обложкой и каталогом товаров. Отличная замена Taplink в шапке профиля.",
    color: "bg-rose-100 text-rose-700",
  },
  {
    icon: TrendingUp,
    title: "0% комиссии и прямые заказы",
    description:
      "Мы не берем процент со сделок. Клиенты находят товары через поиск и пишут вам напрямую в Instagram Direct, Telegram или по телефону.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Users,
    title: "Покупатели со всего Приднестровья",
    description:
      "Единый поиск и фильтры по городам (Тирасполь, Бендеры, Рыбница и др.), категориям, ценам и размерам приводят готовую к покупке аудиторию.",
    color: "bg-sky-100 text-sky-700",
  },
  {
    icon: ShieldCheck,
    title: "Статус проверенного магазина",
    description:
      "Верифицированные магазины получают синий бейдж доверия, привлекают больше кликов и вызывают максимальное доверие покупателей.",
    color: "bg-amber-100 text-amber-700",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Регистрация",
    desc: "Укажите название, Instagram и города доставки за 1 минуту.",
  },
  {
    step: "2",
    title: "Добавление товаров",
    desc: "Загрузите фото, укажите цену, размеры и статус наличия.",
  },
  {
    step: "3",
    title: "Получение заказов",
    desc: "Прикрепите ссылку в Instagram и принимайте сообщения клиентов напрямую.",
  },
];

export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-gray-50/60 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Главная карточка */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
          
          {/* Hero-баннер */}
          <div className="relative bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm tracking-wide uppercase text-rose-100">
              <Sparkles className="h-3.5 w-3.5" />
              Для локального бизнеса ПМР
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Сотрудничество с E-Vitrina
            </h1>
            
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-rose-100 leading-relaxed">
              Объединяем Instagram-магазины Приднестровья в единую удобную платформу.
              Бесплатное размещение, умные фильтры и прямой контакт с покупателями.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-rose-700 shadow-lg transition-all hover:bg-rose-50 active:scale-95"
              >
                <Store className="h-4 w-4" />
                Создать витрину бесплатно
              </Link>
              <a
                href="https://instagram.com/vitrinapmr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-800/80 hover:bg-rose-800 px-6 py-3.5 text-sm font-semibold text-white border border-rose-400/30 transition-all"
              >
                <Instagram className="h-4 w-4" />
                Наш Instagram: @vitrinapmr
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-12 space-y-12">
            
            {/* Преимущества для продавцов */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Почему продавцы выбирают E-Vitrina
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Мы создали инструменты, которых не хватает обычным Instagram-страницам
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {BENEFITS.map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:shadow-md hover:border-gray-200"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Как это работает (3 простых шага) */}
            <section className="rounded-2xl bg-gray-50 p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
                Как подключить магазин
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {STEPS.map((s) => (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-sm mb-3 shadow-sm">
                      {s.step}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{s.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Блок контактов */}
            <section className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center sm:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Handshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Индивидуальные предложения и реклама
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Хотите разместить рекламный баннер, обсудить спецпроект или предложить партнерство? Мы всегда на связи:
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 border border-gray-200 text-sm">
                  <Mail className="h-4 w-4 text-rose-600" />
                  <span className="font-semibold text-gray-800">
                    e-vitrinapmr@mail.ru
                  </span>
                </div>
                <CopyEmailIconButton email="e-vitrinapmr@mail.ru" />
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Отвечаем на письма и запросы в течение рабочего дня.
              </p>
            </section>

            {/* Финальный призыв к действию */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <span>Уже готовы начать? Перейдите к регистрации магазина</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
