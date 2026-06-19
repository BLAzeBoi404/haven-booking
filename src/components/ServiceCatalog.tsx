"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, MapPin, Filter, Users, CheckCircle2, Heart, Zap, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import { usePrefs } from "./PrefsProvider";
import { cn, convertPrice, currencySymbol } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currency";
import { useDebounce } from "@/lib/useDebounce";
import type { ServiceWithProvider } from "@/types";

export function ServiceCatalog({ services }: { services: ServiceWithProvider[] }) {
  const { lang, currency } = usePrefs();
  const [catF, setCatF] = useState("");
  const [cityF, setCityF] = useState("");
  const [maxP, setMaxP] = useState(0);
  const [minR, setMinR] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [sInput, setSInput] = useState("");
  const [cInput, setCInput] = useState("");
  const [visible, setVisible] = useState(24);

  const dSearch = useDebounce(sInput, 350);
  const dCity = useDebounce(cInput, 350);

  const maxSlider = useMemo(() => Math.round(220 * CURRENCIES[currency].rate), [currency]);
  const effectiveMax = maxP === 0 ? maxSlider : maxP;

  const allCats = useMemo(() => [...new Set(services.map((s) => s.category).filter(Boolean))].sort(), [services]);
  const allCities = useMemo(() => [...new Set(services.map((s) => s.providerLocation).filter(Boolean))].sort(), [services]);

  const filtered = useMemo(() => {
    let res = services.filter((sv) => {
      const q = dSearch.toLowerCase();
      const cityQ = (cityF || dCity).toLowerCase();
      const price = convertPrice(sv.priceUSD, currency);
      return (
        (!q || sv.title.toLowerCase().includes(q) || sv.providerName.toLowerCase().includes(q) || sv.category.toLowerCase().includes(q)) &&
        (!cityQ || sv.providerLocation.toLowerCase().includes(cityQ)) &&
        (!catF || sv.category === catF) &&
        price <= effectiveMax &&
        Number(sv.rating) >= minR
      );
    });
    if (sortBy === "priceAsc") res = [...res].sort((a, b) => a.priceUSD - b.priceUSD);
    if (sortBy === "priceDesc") res = [...res].sort((a, b) => b.priceUSD - a.priceUSD);
    if (sortBy === "ratingDesc") res = [...res].sort((a, b) => Number(b.rating) - Number(a.rating));
    return res;
  }, [services, dSearch, dCity, catF, cityF, effectiveMax, minR, sortBy, currency]);

  const clearAll = () => { setSInput(""); setCInput(""); setCatF(""); setCityF(""); setMaxP(0); setMinR(0); setSortBy("recommended"); };
  const stats = [
    { Icon: Users, n: "60+ фахівців", c: "bg-emerald-100 text-emerald-700" },
    { Icon: CheckCircle2, n: "1M+ замовлень", c: "bg-blue-100 text-blue-700" },
    { Icon: Heart, n: "98% задоволені", c: "bg-rose-100 text-rose-700" },
    { Icon: Zap, n: "Підтримка 24/7", c: "bg-amber-100 text-amber-700" },
  ];

  const chipsRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = chipsRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = chipsRef.current;
    if (!el) return;
    window.addEventListener("resize", updateArrows);
    el.addEventListener("scroll", updateArrows, { passive: true });
    // Колесико миші гортає чіпи категорій горизонтально, навіть якщо користувач
    // крутить вертикально — доки курсор над смугою категорій. Також гортає
    // за допомогою тачпаду (deltaX) без перехоплення, коли смуга не зайнята.
    const onWheel = (e: WheelEvent) => {
      const target = chipsRef.current;
      if (!target) return;
      const canScrollX = target.scrollWidth > target.clientWidth + 1;
      if (!canScrollX) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      target.scrollLeft += delta;
      e.preventDefault();
      window.setTimeout(updateArrows, 60);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("resize", updateArrows);
      el.removeEventListener("scroll", updateArrows);
      el.removeEventListener("wheel", onWheel);
    };
  }, [allCats, updateArrows]);

  const scrollChips = useCallback((dir: 1 | -1) => {
    const el = chipsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: "smooth" });
    window.setTimeout(updateArrows, 320);
  }, [updateArrows]);

  // Перетягування миші (drag-to-scroll) для смуги категорій — додатково до
  // колесика й стрілочок. Натиснув — тягни — список гортається.
  const drag = useRef<{ x: number; left: number; active: boolean; moved: boolean }>({ x: 0, left: 0, active: false, moved: false });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = chipsRef.current;
    if (!el) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, active: true, moved: false };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = chipsRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.left - dx;
  }, []);

  const endDrag = useCallback(() => {
    drag.current.active = false;
    setDragging(false);
    window.setTimeout(updateArrows, 60);
  }, [updateArrows]);

  return (
    <>
      <section className="bg-emerald-900 pt-24 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="display text-3xl sm:text-4xl md:text-[46px] font-bold text-white mb-3 leading-snug">
            Знайдіть ідеального <span className="text-emerald-300">фахівця</span>
          </h1>
          <p className="text-emerald-200/75 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Перевірені спеціалісти. Клінінг, ремонт, IT, дизайн та ще 10 категорій.
          </p>
          <div className="bg-white rounded-2xl p-1.5 flex flex-col sm:flex-row gap-1.5 max-w-2xl mx-auto shadow-xl shadow-black/20">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-[background-color]">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input value={sInput} onChange={(e) => setSInput(e.target.value)} placeholder="Яку послугу ви шукаєте?" className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-gray-400" />
            </div>
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 rounded-xl focus-within:bg-white transition-[background-color]">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <input value={cInput} onChange={(e) => setCInput(e.target.value)} placeholder="Місто або країна" className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ Icon, n, c }) => (
            <div key={n} className="flex items-center gap-3 p-3 rounded-xl">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", c)}><Icon className="w-4 h-4" /></div>
              <p className="text-sm font-medium text-gray-700">{n}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="display font-bold text-gray-900">Всі послуги</h2>
            <p className="text-gray-400 text-sm mt-0.5">{filtered.length} результатів</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters((f) => !f)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors", showFilters ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300")}>
              <Filter className="w-4 h-4" />Фільтри
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 outline-none hover:border-gray-300 transition-[border-color] cursor-pointer">
              <option value="recommended">Рекомендовані</option>
              <option value="priceAsc">Ціна ↑</option>
              <option value="priceDesc">Ціна ↓</option>
              <option value="ratingDesc">Рейтинг ↓</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="card p-5 mb-4 slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Категорія</label>
                <select value={catF} onChange={(e) => setCatF(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 transition-[border-color]">
                  <option value="">Всі категорії</option>
                  {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Місто</label>
                <select value={cityF} onChange={(e) => setCityF(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-emerald-400 transition-[border-color]">
                  <option value="">Всі міста</option>
                  {allCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Макс ціна: {currencySymbol(currency)}{effectiveMax}</label>
                <input type="range" min={0} max={maxSlider} step={Math.max(1, Math.round(maxSlider / 50))} value={effectiveMax} onChange={(e) => setMaxP(Number(e.target.value))} style={{ background: `linear-gradient(to right,#059669 ${(effectiveMax / maxSlider) * 100}%,#e5e7eb ${(effectiveMax / maxSlider) * 100}%)` }} className="w-full" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Мін рейтинг</label>
                <div className="flex gap-1.5">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button key={r} onClick={() => setMinR(r)} className={cn("flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors", minR === r ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {r === 0 ? "Всі" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={clearAll} className="mt-3 text-xs font-semibold text-emerald-700 hover:underline">Скинути</button>
          </div>
        )}

        <div className="relative mb-5">
          <button onClick={() => scrollChips(-1)} disabled={!canLeft} aria-label="Попередні категорії" className={cn("flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center transition-[opacity,color,border-color] disabled:opacity-0 disabled:pointer-events-none", canLeft ? "text-gray-600 hover:text-emerald-700 hover:border-emerald-300" : "text-gray-300 cursor-default")}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scrollChips(1)} disabled={!canRight} aria-label="Наступні категорії" className={cn("flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center transition-[opacity,color,border-color] disabled:opacity-0 disabled:pointer-events-none", canRight ? "text-gray-600 hover:text-emerald-700 hover:border-emerald-300" : "text-gray-300 cursor-default")}>
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="px-1">
            <div
              ref={chipsRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              className={cn("flex gap-2 overflow-x-auto no-scrollbar px-1 py-1 select-none", dragging ? "cursor-grabbing" : "cursor-grab")}
              style={{ scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}
              title="Гортайте колесиком, тягніть або натискайте стрілочки"
            >
              <button onClick={(e) => { if (drag.current.moved) { e.preventDefault(); return; } setCatF(""); }} className={cn("px-3.5 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors shrink-0", catF === "" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>Всі категорії</button>
              {allCats.map((c) => (
                <button key={c} onClick={(e) => { if (drag.current.moved) { e.preventDefault(); return; } setCatF(catF === c ? "" : c); }} className={cn("px-3.5 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors shrink-0", catF === c ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="display font-bold text-gray-800 mb-1">Нічого не знайдено</h3>
            <p className="text-gray-500 text-sm mb-5">Спробуйте змінити параметри пошуку.</p>
            <button onClick={clearAll} className="bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm">Скинути</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.slice(0, visible).map((sv) => <ServiceCard key={sv.id} s={sv} lang={lang} currency={currency} />)}
            </div>
            {filtered.length > visible && (
              <div className="text-center mt-6">
                <button onClick={() => setVisible((v) => v + 24)} className="bg-white border border-gray-200 text-gray-700 font-semibold px-7 py-2.5 rounded-xl hover:border-emerald-400 hover:text-emerald-700 transition-[border-color,color] text-sm">
                  Показати ще ({filtered.length - visible})
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1400px] mx-auto px-4 pb-12">
        <div className="bg-emerald-900 rounded-2xl px-8 py-12 text-center">
          <h2 className="display text-2xl font-bold text-white mb-2">Стати фахівцем</h2>
          <p className="text-emerald-200/75 text-sm mb-6 max-w-sm mx-auto">Публікуйте свої послуги та отримуйте замовлення від клієнтів.</p>
          <a href="/register" className="inline-flex items-center gap-2 bg-white text-emerald-900 font-semibold px-7 py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm">
            Зареєструватись безкоштовно <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </>
  );
}
