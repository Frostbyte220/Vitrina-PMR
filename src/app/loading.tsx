export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gray-50 pb-24">
      {/* Скелетон шапки и поиска */}
      <section className="bg-white px-4 pt-8 pb-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl flex flex-col items-center mb-6">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
        </div>
        
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-2">
            <div className="h-12 flex-1 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0"></div>
          </div>
          <div className="flex gap-2 mt-4 overflow-hidden">
             {/* Скелетон кнопок категорий */}
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse flex-shrink-0"></div>
             ))}
          </div>
        </div>
      </section>

      {/* Скелетон сетки товаров (12 карточек, так как ITEMS_PER_PAGE = 12) */}
      <section className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
              {/* Картинка */}
              <div className="aspect-[4/5] w-full rounded-xl bg-gray-100 animate-pulse"></div>
              
              {/* Контент */}
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
      </section>
    </main>
  );
}