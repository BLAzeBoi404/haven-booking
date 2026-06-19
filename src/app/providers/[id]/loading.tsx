// =====================================================================
//  loading.tsx — skeleton профілю фахівця (Suspense).
//  Зʼявляється миттєво під час серверного fetch, замість білого екрана.
// =====================================================================

export default function Loading() {
  return (
    <div className="pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Назад */}
        <div className="h-4 w-24 bg-gray-100 rounded mb-6 mt-2 animate-pulse" />

        {/* Шапка профілю */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card p-4 h-20 animate-pulse" />
          ))}
        </div>

        {/* Послуги */}
        <div className="space-y-3">
          <div className="h-5 w-32 bg-gray-100 rounded mb-2 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-40 bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
