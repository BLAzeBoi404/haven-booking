// =====================================================================
//  loading.tsx — skeleton сторінки деталі послуги (Suspense).
//  Зʼявляється миттєво під час серверного fetch, замість білого екрана.
// =====================================================================

export default function Loading() {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Назад */}
        <div className="h-4 w-24 bg-gray-100 rounded mb-6 mt-2 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва колонка */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card overflow-hidden">
              <div className="h-64 sm:h-80 bg-gray-100 animate-pulse" />
              <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-14 bg-gray-100 rounded-lg shrink-0 animate-pulse" />
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="h-6 w-2/3 bg-gray-100 rounded mb-3 animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-100 rounded mb-5 animate-pulse" />
              <div className="space-y-2 mb-5">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
                <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
                <div className="h-3.5 w-5/6 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 h-20 animate-pulse" />
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="h-5 w-32 bg-gray-100 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="pb-4 border-b border-gray-100">
                    <div className="h-4 w-1/4 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Права колонка (sticky-картка) */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20">
              <div className="h-3 w-12 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-9 w-28 bg-gray-100 rounded mb-4 animate-pulse" />
              <div className="h-16 w-full bg-gray-50 rounded-xl mb-4 animate-pulse" />
              <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
