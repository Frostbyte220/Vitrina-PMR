export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* 1. Header / Hero Skeleton */}
      <section className="bg-white px-4 pt-7 pb-5 shadow-2xs sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mt-7 sm:mt-0 flex flex-col items-center">
          <div className="h-9 w-48 sm:w-64 rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-2.5 h-4 w-60 sm:w-80 rounded-md bg-gray-100 animate-pulse" />
        </div>
      </section>

      {/* 2. Banner Carousel Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-5">
        <div className="h-44 sm:h-64 w-full rounded-2xl sm:rounded-3xl bg-gray-200/80 animate-pulse" />
      </div>

      {/* 3. Search Bar Skeleton */}
      <div className="mx-auto max-w-2xl px-4 mt-4 sm:mt-5">
        <div className="h-12 w-full rounded-full bg-white shadow-xs border border-gray-100 animate-pulse" />
      </div>

      {/* 4. Category Chips Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5">
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 shrink-0 rounded-full bg-white border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* 5. Product Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100"
            >
              <div className="aspect-[4/5] w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="space-y-2 px-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="pt-2 flex justify-between items-center">
                  <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-7 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
