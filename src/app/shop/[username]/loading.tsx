import { Header } from "@/components/layout/Header";

export default function ShopLoading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl pb-12">
        {/* Обложка */}
        <div className="h-48 w-full bg-gray-200 animate-pulse sm:h-64 sm:rounded-b-3xl"></div>

        <div className="px-4 sm:px-6">
          {/* Аватар и название */}
          <div className="relative -mt-16 mb-8 flex flex-col items-center sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
            <div className="h-32 w-32 shrink-0 rounded-full border-4 border-white bg-gray-200 animate-pulse sm:h-40 sm:w-40"></div>
            <div className="mt-4 flex flex-col items-center sm:items-start gap-2 sm:pb-4">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="mb-6 h-px w-full bg-gray-200"></div>

          {/* Заголовок и фильтры */}
          <div className="mb-6 space-y-4">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Сетка товаров в стиле твоего дизайна */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm border border-gray-50">
                <div className="aspect-[4/5] w-full rounded-xl bg-gray-100 animate-pulse"></div>
                <div className="space-y-2 px-1">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}