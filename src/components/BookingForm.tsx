// =====================================================================
//  BookingForm — Optimistic UI через useOptimistic + useTransition (§2.6/§3.4)
//
//  Клієнт бачить підтвердження бронювання за ~16мс (1 фрейм), ще ДО того,
//  як PostgreSQL фізично зафіксує ACID-транзакцію. Якщо виникає колізія
//  (слот перехоплено конкурентною транзакцією), React ТИХО відкочує
//  DOM до попереднього стану + тостер «Слот перехоплено».
// =====================================================================

"use client";

import { useState, useOptimistic, useTransition } from "react";
import { CheckCircle2, AlertCircle, Check, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking } from "@/server/actions/bookings";
import type { Lang, Currency } from "@/types";
import { getT } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/currency";
import { Spinner } from "./primitives";

interface Props {
  serviceId: string;
  providerId: string;
  serviceTitle: string;
  providerName: string;
  priceUSD: number;
  lang: Lang;
  currency: Currency;
  onDone: () => void;
  onClose: () => void;
}

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "15:00", "17:00"];

// Оптимистичний стан: який «крок» ми показуємо юзеру миттєво
type OptimisticState = { step: number; collision: boolean };

export function BookingForm({ serviceId, providerId, serviceTitle, providerName, priceUSD, lang, currency, onDone, onClose }: Props) {
  const t = getT(lang);
  const { sym, rate } = CURRENCIES[currency];
  const price = Math.round(priceUSD * rate);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(() => computeDate("tomorrow"));
  const [dateLabel, setDateLabel] = useState("tomorrow");
  const [time, setTime] = useState("10:00");
  const [comment, setComment] = useState("");

  // Optimistic UI — миттєвий відгук інтерфейсу
  const [optimistic, setOptimistic] = useOptimistic<OptimisticState, Partial<OptimisticState>>(
    { step, collision: false },
    (state, next) => ({ ...state, ...next }),
  );
  const [isPending, startTransition] = useTransition();

  const dLabel = { today: t.today, tomorrow: t.tomorrow, nextWeek: t.nextWeek };

  const confirm = () => {
    // useTransition + useOptimistic: UI мутує миттєво, далі йде Server Action
    startTransition(async () => {
      setOptimistic({ step: 2, collision: false }); // показуємо «Бронювання відправлено…» за 1 фрейм
      try {
        const res = await createBooking({ serviceId, providerId, date, time, comment });
        if (res.ok) {
          setStep(3);
          return;
        }
        // Слот зайнятий → показуємо collision-стан
        if (res.collision) {
          setStep(1);
          setOptimistic({ step: 1, collision: true });
          return;
        }
        // Інша помилка (зокрема «необхідно увійти») → повертаємось до кроку 1
        // і пробуємо перевести користувача на логін.
        setStep(1);
        setOptimistic({ step: 1, collision: false });
        if (/війти|login|sign in|увійти|систем[іи]|sign up|register|зареєструватися/i.test(res.error)) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      } catch {
        // Серверна помилка мережі/RPC — відкочуємо optimistic.
        setStep(1);
        setOptimistic({ step: 1, collision: false });
      }
    });
  };

  const Circle = ({ i }: { i: number }) => (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors", i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-400")}>
      {i < step ? <Check className="w-4 h-4" /> : i + 1}
    </div>
  );

  // Крок 3 — успіх
  if (optimistic.step >= 3 || step === 3) {
    return (
      <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 fade-in">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl relative z-10 pop-in">
          <div className="text-center py-8 px-6">
            <div className="w-[72px] h-[72px] bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h3 className="display text-xl font-bold text-gray-900 mb-1">{t.bookingSuccess}</h3>
            <p className="text-gray-500 text-sm mb-0.5">{t.confirmed} <strong className="text-gray-800">{dLabel[dateLabel as keyof typeof dLabel] ?? date}, {time}</strong></p>
            <p className="text-gray-400 text-sm mb-1">{providerName}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-7">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />{t.statusConfirmed}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">{t.backSearch}</button>
              <button onClick={onDone} className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm">{t.myBookings}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={step < 2 ? onClose : undefined} />
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl relative z-10 pop-in max-h-[94dvh] flex flex-col">
        {step < 2 && (
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Circle i={0} />
              <div className={cn("w-8 h-0.5", step > 0 ? "bg-emerald-500" : "bg-gray-200")} />
              <Circle i={1} />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 transition-colors"><X className="w-5 h-5" /></button>
          </div>
        )}

        <div className="p-6 overflow-y-auto no-scrollbar">
          {/* Крок 0 — вибір дати/часу */}
          {step === 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.selectDate}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {(["today", "tomorrow", "nextWeek"] as const).map((d) => (
                  <button key={d} onClick={() => { setDate(computeDate(d)); setDateLabel(d); }} className={cn("py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors", dateLabel === d ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                    {dLabel[d]}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.selectTime}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {SLOTS.map((tm) => (
                  <button key={tm} onClick={() => setTime(tm)} className={cn("py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors", time === tm ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                    {tm}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t.comment}</p>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder={t.commentPh} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-400 text-sm resize-none mb-5" />
              <button onClick={() => setStep(1)} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors">Далі →</button>
            </>
          )}

          {/* Крок 1 — підтвердження / Optimistic крок 2 */}
          {(step === 1 || optimistic.step === 2) && (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-5">
                <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{serviceTitle}</p>
                  <p className="text-emerald-700 text-xs font-medium mt-0.5">{providerName} · {sym}{price}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t.date}</span>
                  <span className="font-semibold text-gray-900">{dLabel[dateLabel as keyof typeof dLabel] ?? date}, {time}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.total}</span>
                  <span className="font-semibold text-gray-900">{sym}{price}</span>
                </div>
              </div>

              {optimistic.collision && (
                <div className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800">Слот перехоплено</p>
                    <p className="text-xs text-orange-700 mt-0.5">{t.collision}</p>
                  </div>
                </div>
              )}

              {optimistic.step === 2 && !optimistic.collision && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
                  <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">{t.optimisticMsg}</p>
                </div>
              )}

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 mb-5">
                <p className="text-xs text-emerald-700 leading-relaxed">{t.paymentInfo}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} disabled={isPending} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60">← {t.back}</button>
                <button onClick={confirm} disabled={isPending} className={cn("flex-1 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60", optimistic.collision ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-700 hover:bg-emerald-600")}>
                  {isPending ? <><Spinner />{t.confirmBook}</> : optimistic.collision ? "Обрати інший час" : t.confirmBook}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Обчислити ISO-дату для пресету. */
function computeDate(preset: "today" | "tomorrow" | "nextWeek"): string {
  const d = new Date();
  if (preset === "tomorrow") d.setDate(d.getDate() + 1);
  if (preset === "nextWeek") d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}
