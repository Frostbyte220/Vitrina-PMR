import type { Metadata } from "next";
import { Store, Lightbulb, HeartHandshake } from "lucide-react";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton"; // 🔥 Импортируем нашу новую кнопку

export const metadata: Metadata = {
  title: "О проекте | Vitrina PMR",
  description: "Узнайте больше о платформе Vitrina PMR, нашей миссии и возможностях сотрудничества.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            О проекте <span className="text-rose-600">Vitrina PMR</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Делаем онлайн-шопинг в Приднестровье удобнее, быстрее и прозрачнее.
          </p>
        </div>

        {/* Основной контент */}
        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm outline outline-1 outline-gray-200 sm:p-10">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Store className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Для чего мы создали этот сервис?</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Мы заметили, как сложно бывает найти нужный товар среди десятков разрозненных Instagram-аккаунтов локальных магазинов. Поиск занимает много времени, а алгоритмы соцсетей часто прячут интересные предложения. 
              <br /><br />
              <strong>Vitrina PMR</strong> — это единый каталог, где мы объединяем предложения продавцов со всего Приднестровья. Наша миссия — дать покупателям удобные фильтры, быстрый поиск и комфортный выбор, а местным предпринимателям — новую удобную площадку для развития своего дела.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Сотрудничество и обратная связь</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Проект активно развивается, и мы открыты к диалогу! Если вы хотите стать партнером платформы, столкнулись с ошибкой или у вас есть крутая идея, какого функционала не хватает на сайте — обязательно напишите нам. 
              Мы внимательно читаем все пожелания и внедряем лучшие из них.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-gray-50 p-6 outline outline-1 outline-gray-200">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-gray-900">Напишите нам на почту:</h3>
                {/* Эту текстовую ссылку оставим как mailto на всякий случай */}
                <a 
                  href="mailto:vitrinapmr@mail.ru" 
                  className="mt-1 inline-block text-lg font-medium text-rose-600 transition-colors hover:text-rose-700"
                >
                  vitrinapmr@mail.ru
                </a>
              </div>
              
              {/* 🔥 Вставляем компонент, который будет копировать почту */}
              <CopyEmailButton email="vitrinapmr@mail.ru" />
            </div>
          </section>

          <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <Lightbulb className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Ваши отзывы помогают делать Vitrina PMR лучше каждый день. Спасибо, что вы с нами!
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}