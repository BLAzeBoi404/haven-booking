"use client";

import { useState, useOptimistic, useTransition, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, AlertCircle, Check, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking, getBookedSlots } from "@/server/actions/bookings";
import type { Lang, Currency } from "@/types";
import { getT } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/currency";
import { Spinner } from "./primitives";
import { slotsFor, nextDays, parseWorkingHours, DOW_SHORT_UK, DOW_SHORT_EN, MONTH_SHORT_UK, MONTH_SHORT_EN } from "@/lib/schedule";

interface Props {
  serviceId: string;
  providerId: string;
  serviceTitle: string;
  providerName: string;
  priceUSD: number;
  workingHours: string;
  lang: Lang;
  currency: Currency;
  onDone: () => void;
  onClose: () => void;
}

type OptimisticState = { step: number; collision: boolean };

const DAY_COUNT = 14;

export function BookingForm({ serviceId, providerId, serviceTitle, providerName, priceUSD, workingHours, lang, currency, onDone, onClose }: Props) {
  const t = getT(lang);
  const { sym, rate } = CURRENCIES[currency];
  const price = Math.round(priceUSD * rate);

  const days = nextDays(DAY_COUNT);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(days[1].date); // завтра за замовчуванням
  const [time, setTime] = useState<string>("");
  const [comment, setComment] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [optimistic, setOptimistic] = useOptimistic<OptimisticState, Partial<OptimisticState>>(
    { step, collision: false },
    (state, next) => ({ ...state, ...next }),
  );
  const [isPending, startTransition] = useTransition();

  const slots = slotsFor(workingHours);
  const wh = parseWorkingHours(workingHours);
  const dow = lang === "uk" ? DOW_SHORT_UK : DOW_SHORT_EN;
  const months = lang === "uk" ? MONTH_SHORT_UK : MONTH_SHORT_EN;
  const selectedDay = days.find((d) => d.date === date);

  // Загрузка занятых слотов при смене даты
  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setTime("");
    let cancelled = false;
    getBookedSlots(providerId, date)
      .then((s) => { if (!cancelled) setBooked(s); })
      .catch(() => { if (!cancelled) setBooked([]); })
      .finally(() => { if (!cancelled) setSlotsLoading(false); });
    return () => { cancelled = true; };
  }, [providerId, date]);

  // Карусель дней
  const daysRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = daysRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = daysRef.current;
    if (!el) return;
    window.addEventListener("resize", updateArrows);
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      window.removeEventListener("resize", updateArrows);
      el.removeEventListener("scroll", updateArrows);
    };
  }, [updateArrows]);

  const scrollDays = (dir: 1 | -1) => {
    const el = daysRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: "smooth" });
    window.setTimeout(updateArrows, 320);
  };

  const confirm = () => {
    if (!time) return;
    startTransition(async () => {
      setOptimistic({ step: 2, collision: false });
      try {
        const res = await createBooking({ serviceId, providerId, date, time, comment });
        if (res.ok) {
          setStep(3);
          return;
        }
        if (res.collision) {
          setStep(1);
          setOptimistic({ step: 1, collision: true });
          getBookedSlots(providerId, date).then(setBooked).catch(() => {});
          return;
        }
        setStep(1);
        setOptimistic({ step: 1, collision: false });
        if (/війти|login|sign in|увійти|систем[іи]|sign up|register|зареєструватися/i.test(res.error)) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      } catch {
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

  const formatDateLabel = (d: typeof selectedDay) => {
    if (!d) return date;
    return `${dow[d.dow]}, ${d.day} ${months[d.month].toLowerCase()}`;
  };

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
            <p className="text-gray-500 text-sm mb-0.5">{t.confirmed} <strong className="text-gray-800">{formatDateLabel(selectedDay)}, {time}</strong></p>
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
          {step === 0 && (
            <>
              {/* Лента дней со стрелками */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.selectDay}</p>
                <span className="text-xs text-gray-400">{t.workingHoursLabel}: {String(wh.start).padStart(2, "0")}:00–{String(wh.end).padStart(2, "0")}:00</span>
              </div>
              <div className="relative mb-5">
                <button onClick={() => scrollDays(-1)} disabled={!canLeft} className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-opacity disabled:opacity-0 disabled:pointer-events-none", canLeft && "hover:text-emerald-700 hover:border-emerald-300")}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollDays(1)} disabled={!canRight} className={cn("absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center transition-opacity disabled:opacity-0 disabled:pointer-events-none", canRight && "hover:text-emerald-700 hover:border-emerald-300")}>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div ref={daysRef} className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth">
                  {days.map((d) => {
                    const selected = d.date === date;
                    return (
                      <button
                        key={d.date}
                        onClick={() => setDate(d.date)}
                        className={cn(
                          "shrink-0 w-[58px] py-2.5 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-colors",
                          selected ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300",
                        )}
                      >
                        <span className="text-[10px] font-medium uppercase">{dow[d.dow]}</span>
                        <span className="text-lg font-bold leading-none">{d.day}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{months[d.month].toLowerCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Слоты по графику */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.selectTime}</p>
              {slotsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                  <Spinner /> {t.loadingSlots}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">—</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {slots.map((tm) => {
                    const isBooked = booked.includes(tm);
                    const isSelected = time === tm;
                    return (
                      <button
                        key={tm}
                        onClick={() => !isBooked && setTime(tm)}
                        disabled={isBooked}
                        className={cn(
                          "py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors",
                          isBooked
                            ? "border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                            : isSelected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                              : "border-gray-200 text-gray-600 hover:border-emerald-300",
                        )}
                      >
                        {tm}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t.comment}</p>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder={t.commentPh} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-400 text-sm resize-none mb-5" />
              <button onClick={() => setStep(1)} disabled={!time} className={cn("w-full text-white font-semibold py-3 rounded-xl transition-colors", time ? "bg-emerald-700 hover:bg-emerald-600" : "bg-gray-300 cursor-not-allowed")}>{t.nextStep} →</button>
            </>
          )}

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
                  <span className="font-semibold text-gray-900">{formatDateLabel(selectedDay)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.time}</span>
                  <span className="font-semibold text-gray-900">{time}</span>
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
                    <p className="text-sm font-semibold text-orange-800">{t.collisionHeading}</p>
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
                  {isPending ? <><Spinner />{t.confirmBook}</> : optimistic.collision ? t.collisionRetry : t.confirmBook}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
