// =====================================================================
//  loading.tsx — Skeleton UI під час рендерингу (§3.4, Suspense).
//  Каркасні екрани замість «білих» — маскування мережевої латентності.
// =====================================================================

import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Завантаження…</p>
      </div>
    </div>
  );
}
