import type { Metadata } from "next";
import { Mail, Handshake } from "lucide-react";
import { CopyEmailIconButton } from "@/components/ui/CopyEmailIconButton";

export const metadata: Metadata = {
  title: "Сотрудничество | Vitrina PMR",
  description:
    "Информация для партнеров и предложения по сотрудничеству с платформой Vitrina PMR.",
};

export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white px-6 py-12 shadow-sm sm:p-16">
          {/* Заголовок страницы */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <Handshake className="h-8 w-8 text-rose-700" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Сотрудничество
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Мы всегда открыты для новых идей и взаимовыгодного партнерства
            </p>
          </div>

          {/* Основной текстовый блок */}
          <div className="mt-12 space-y-8 text-gray-600">
            <p className="text-base leading-relaxed text-center sm:text-left">
              Проект <strong>Vitrina PMR</strong> активно развивается, и мы
              приглашаем к сотрудничеству локальные магазины, бренды и
              предпринимателей Приднестровья. Если вы хотите разместить свои
              товары на нашей платформе, обсудить рекламу или предложить
              нестандартные форматы взаимодействия — мы будем рады вас
              выслушать!
            </p>

            {/* Блок с контактами */}
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center sm:p-8">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Для сотрудничества и предложений:
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Напишите нам на электронную почту, и мы ответим вам в ближайшее
                время.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm outline outline-1 outline-gray-200">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    vitrinapmr@mail.ru
                  </span>
                </div>
                {/* Наша кнопка копирования из предыдущего шага */}
                <CopyEmailIconButton email="vitrinapmr@mail.ru" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
