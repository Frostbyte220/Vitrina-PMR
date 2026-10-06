"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Store, X, ChevronRight, CheckCircle2, Instagram, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SellerOnboardingWidget() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Проверяем localStorage после монтирования, чтобы избежать hydration mismatch
  useEffect(() => {
    if (status === "loading") return;
    
    // Если пользователь авторизован, не показываем плашку вообще
    if (session?.user) {
      setIsVisible(false);
      return;
    }

    const hidden = localStorage.getItem("hideSellerWidget");
    if (!hidden) {
      // Небольшая задержка перед появлением плашки, чтобы не перегружать интерфейс сразу
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, session]);

  const handleClosePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem("hideSellerWidget", "true");
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setIsVisible(false);
    localStorage.setItem("hideSellerWidget", "true");
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));

  if (!isVisible && !isWizardOpen) return null;

  return (
    <>
      {/* ── ПЛАВАЮЩАЯ КНОПКА (PROMPT) ── */}
      {isVisible && !isWizardOpen && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          <div 
            onClick={() => setIsWizardOpen(true)}
            className="group relative flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl outline outline-1 outline-rose-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:outline-rose-300"
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleClosePrompt}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-sm hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-inner">
              <Store className="h-6 w-6" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">Продаете в ПМР?</span>
              <span className="text-xs text-rose-600 font-medium">Открыть магазин (Бесплатно)</span>
            </div>
          </div>
        </div>
      )}

      {/* ── МОДАЛЬНОЕ ОКНО WIZARD ── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Кнопка закрытия (крестик) */}
            <button
              onClick={handleCloseWizard}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Прогресс-бар вверху */}
            <div className="flex w-full h-1 bg-gray-100">
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <div className="p-6 sm:p-8">
              {/* ШАГ 1: Приветствие */}
              {step === 1 && (
                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Store className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-center text-2xl font-bold text-gray-900">
                    Добро пожаловать на Витрину!
                  </h3>
                  <p className="text-center text-gray-600 leading-relaxed mb-8">
                    Это место, где местные покупатели могут легко находить ваши товары. 
                    <br/><br/>
                    Мы помогаем Instagram-магазинам Приднестровья получать больше заказов <strong>абсолютно бесплатно</strong>.
                  </p>
                  <button
                    onClick={nextStep}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
                  >
                    Как это работает? <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* ШАГ 2: Как это работает */}
              {step === 2 && (
                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
                    Процесс проще простого
                  </h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Регистрация</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Создаете профиль за 1 минуту.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Настройка магазина</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Добавляете название, логотип и ссылку на Instagram.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Добавление товаров</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Загружаете фото, описание и цену без ограничений.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">4</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Сообщения в Direct</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Покупатели находят товары и пишут напрямую вам.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={nextStep}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
                  >
                    Понятно, дальше <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* ШАГ 3: Финал */}
              {step === 3 && (
                <div className="animate-in slide-in-from-right-4 fade-in duration-300 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Готовы начать?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    Никаких скрытых комиссий или подписок. Мы развиваем проект для поддержки местного бизнеса.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        handleCloseWizard();
                        router.push("/login?register=true");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
                    >
                      <Store className="h-5 w-5" /> Зарегистрировать магазин
                    </button>
                    <button
                      onClick={handleCloseWizard}
                      className="flex w-full items-center justify-center py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Может быть позже
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
