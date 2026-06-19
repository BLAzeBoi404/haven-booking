// =====================================================================
//  BookingsList — список бронювань клієнта з Optimistic-скасуванням.
// =====================================================================

"use client";

import { useState } from "react";
import { BookOpen, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { cancelBooking } from "@/server/actions/bookings";
import type { Lang, Currency, BookingItem } from "@/types";
import { getT, STATUS_MAP } from "@/lib/i18n";
import { convertPrice, currencySymbol } from "@/lib/utils";

export function BookingsList({ bookings, lang, currency }: { bookings: BookingItem[]; lang: Lang; currency: Currency }) {
  const t = getT(lang);
  const sym = currencySymbol(currency);
  const [list, setList] = useState(bookings);

  const doCancel = async (id: string) => {
    // Optimistic: одразу позначаємо скасованим, потім підтверджуємо сервером
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED_USER" as const } : b)));
    await cancelBooking(id);
  };

  const activeCount = list.filter((b) => b.status === "CONFIRMED").length;

  if (list.length === 0) {
    return (
      <div className="card p-16 text-center">
        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h3 className="display font-bold text-gray-800 mb-1">{t.noBookings}</h3>
        <p className="text-gray-500 text-sm mb-6">Знайдіть потрібну послугу та зробіть перше бронювання.</p>
        <a href="/" className="inline-block bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm">{t.allServices}</a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="display text-2xl font-bold text-gray-900">{t.myBookings}</h1>
        {activeCount > 0 && <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">{activeCount} активних</span>}
      </div>
      <div className="space-y-3">
        {list.map((b) => {
          const info = STATUS_MAP[b.status];
          const isActive = b.status === "CONFIRMED";
          return (
            <div key={b.id} className="card p-5 flex gap-4 items-start">
              <div className={cn("w-1 self-stretch rounded-full shrink-0", info.dot)} />
              <div className="flex-1 min-w-0">
                <p className="display font-bold text-gray-900 mb-0.5 text-sm">{b.serviceName}</p>
                <p className="text-emerald-700 text-sm font-medium mb-2">{b.providerName}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.date}, {b.time}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{sym}{convertPrice(Number(b.priceUSD), currency)}</span>
                </div>
                {b.comment && <p className="text-gray-400 text-xs mt-1.5 italic">&quot;{b.comment}&quot;</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", info.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} />{t[info.key as keyof typeof t] as string}
                </span>
                {isActive && (
                  <button onClick={() => doCancel(b.id)} className="text-rose-400 hover:text-rose-600 text-xs font-semibold transition-colors">{t.cancelBook}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
