import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddProductForm from "@/app/dashboard/AddProductForm";

export const metadata: Metadata = {
  title: "Добавить товар | Панель управления | E-Vitrina PMR",
  description: "Добавление нового товара в каталог витрины магазина",
};

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Загружаем профиль магазина пользователя для отображения в заголовке
  const store = await prisma.store.findFirst({
    where: {
      user: { email: session.user.email },
    },
    select: { id: true, name: true, slug: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8 pb-28">
      {/* Кнопка навигации назад */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к списку товаров</span>
        </Link>
      </div>

      {/* Карточка формы создания товара */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Добавление нового товара
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                {store?.name
                  ? `Товар будет опубликован на витрине магазина «${store.name}»`
                  : "Заполните параметры товара для публикации в каталоге"}
              </p>
            </div>
          </div>
        </div>

        <AddProductForm />
      </div>
    </main>
  );
}
