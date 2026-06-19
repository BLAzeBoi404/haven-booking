"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Clock, Award, User, MapPin, Phone, Mail, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn, convertPrice, currencySymbol } from "@/lib/utils";
import { buildGallery } from "@/lib/images";
import { Stars, Chip, Avatar } from "./primitives";
import { ReviewForm } from "./ReviewForm";
import { BookingForm } from "./BookingForm";
import { usePrefs } from "./PrefsProvider";
import { getT } from "@/lib/i18n";
import type { ServiceDetail, ProviderSummary, ReviewItem, SessionUser } from "@/types";

export function ServiceDetailClient({
  service,
  provider,
  reviews,
  user,
}: {
  service: ServiceDetail;
  provider: ProviderSummary;
  reviews: ReviewItem[];
  user: SessionUser | null;
}) {
  const { lang, currency } = usePrefs();
  const t = getT(lang);
  const sym = currencySymbol(currency);
  const price = convertPrice(service.priceUSD, currency);

  const images = buildGallery(service.images, service.category, 10);
  const [imgIdx, setImgIdx] = useState(0);
  const [showBook, setShowBook] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : String(service.rating);

  const goImg = useCallback((dir: -1 | 1) => {
    setImgIdx((i) => (i + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") goImg(-1);
      if (e.key === "ArrowRight") goImg(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, goImg]);

  return (
    <div className="pt-20 pb-16 fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 mt-2 transition-colors">
          <ChevronLeft className="w-4 h-4" />{t.backSearch}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="card overflow-hidden">
              <div className="relative h-64 sm:h-80 bg-gray-100 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[imgIdx]} alt="" className="w-full h-full object-cover transition-transform duration-500" />
                <Chip cat={service.category} className="absolute top-3 left-3" />
                {provider.verified && (
                  <span className="absolute top-3 right-3 bg-white text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />{t.verified}
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => goImg(-1)} aria-label="Попереднє фото" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => goImg(1)} aria-label="Наступне фото" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => setLightbox(true)} aria-label="Збільшити фото" className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/55 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                      {imgIdx + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar bg-gray-50 border-t border-gray-100">
                  {images.map((img, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={img} alt="" onClick={() => setImgIdx(i)} className={cn("w-20 h-14 object-cover rounded-lg cursor-pointer border-2 shrink-0 transition-[border-color,opacity]", imgIdx === i ? "border-emerald-500 opacity-100" : "border-transparent opacity-60 hover:opacity-95")} />
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="display text-xl font-bold text-gray-900 leading-snug mb-1">{service.title}</h1>
                  <Link href={`/providers/${provider.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition-colors font-medium">
                    <User className="w-3.5 h-3.5" />{provider.name}<span className="text-gray-300 mx-1">·</span><MapPin className="w-3.5 h-3.5" />{provider.location}
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Stars rating={Number(avg)} />
                  <span className="font-bold text-gray-900">{avg}</span>
                  <span className="text-gray-400 text-sm">({reviews.length})</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { Icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Безпечна угода", desc: "Оплата після виконання" },
                  { Icon: Clock, color: "text-blue-600", bg: "bg-blue-50", title: "Підтримка", desc: "Допоможемо вирішити" },
                  { Icon: Award, color: "text-amber-600", bg: "bg-amber-50", title: "Гарантія", desc: "Відповідальність виконавця" },
                ].map(({ Icon, color, bg, title, desc }) => (
                  <div key={title} className={cn(bg, "rounded-xl p-3")}>
                    <Icon className={cn("w-5 h-5 mb-2", color)} />
                    <p className="text-xs font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="display font-bold text-gray-900 mb-4">Відгуки{reviews.length > 0 ? ` (${reviews.length})` : ""}</h2>
              <ReviewForm serviceId={service.id} lang={lang} existing={user ? reviews.find((r) => r.authorId === user.id) ?? null : null} />
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className={cn("pb-4", reviews.indexOf(r) < reviews.length - 1 && "border-b border-gray-100")}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">{r.authorName[0]}</div>
                        <span className="font-semibold text-sm text-gray-900">{r.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Stars rating={r.rating} sm />
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("uk-UA")}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-9">{r.text}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-sm text-gray-400 italic">Ще немає відгуків.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20">
              <div className="mb-4">
                <span className="text-xs text-gray-400 font-medium">{t.fromPrice}</span>
                <div className="display text-3xl font-bold text-gray-900">{sym}{price}</div>
              </div>
              <Link href={`/providers/${provider.id}`} className="flex items-center gap-3 w-full p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-[border-color] mb-4 text-left">
                <Avatar name={provider.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{provider.name}</p>
                  <div className="flex items-center gap-1">
                    <Stars rating={provider.rating} sm />
                    <span className="text-xs text-gray-500">{provider.rating.toFixed(1)}</span>
                  </div>
                </div>
                <ChevronRightIcon />
              </Link>
              <button onClick={() => { if (!user) { window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`; return; } setShowBook(true); }} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors mb-2 display text-sm">{t.bookNow}</button>
              <div className="space-y-2.5 pt-4 border-t border-gray-100">
                {provider.phone && <div className="flex items-center gap-2.5 text-sm text-gray-600"><Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{provider.phone}</div>}
                <div className="flex items-center gap-2.5 text-sm text-gray-600"><Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />Написати через форму</div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600"><Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />Відповідає за 1–2 год</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center fade-in" onClick={() => setLightbox(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(false); }} aria-label="Закрити" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goImg(-1); }} aria-label="Попереднє" className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[imgIdx]} alt="" onClick={(e) => e.stopPropagation()} className="max-w-[92vw] max-h-[86vh] object-contain rounded-lg" />
          <button onClick={(e) => { e.stopPropagation(); goImg(1); }} aria-label="Наступне" className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full">
            {imgIdx + 1} / {images.length}
          </div>
        </div>
      )}

      {showBook && (
        <BookingForm
          serviceId={service.id}
          providerId={provider.id}
          serviceTitle={service.title}
          providerName={provider.name}
          priceUSD={service.priceUSD}
          workingHours={provider.workingHours}
          lang={lang}
          currency={currency}
          onDone={() => (window.location.href = "/bookings")}
          onClose={() => setShowBook(false)}
        />
      )}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300 shrink-0">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
