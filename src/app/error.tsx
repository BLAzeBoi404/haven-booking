// =====================================================================
//  error.tsx — Error Boundary (§3.4). Якщо щось падає, ламається лише
//  конкретний блок, а не весь додаток. Залишає Header/Footer живими.
// =====================================================================

"use client";

import { AlertCircle } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="display text-xl font-bold text-gray-900 mb-2">Щось пішло не так</h2>
        <p className="text-gray-500 text-sm mb-6">Спробуйте оновити сторінку.</p>
        <button onClick={reset} className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
          Спробувати знову
        </button>
      </div>
    </div>
  );
}
