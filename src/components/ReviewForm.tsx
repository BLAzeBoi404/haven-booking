// =====================================================================
//  ReviewForm — форма відгуку клієнта (клієнтський компонент).
// =====================================================================

"use client";

import { useState } from "react";
import { Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { addReview } from "@/server/actions/reviews";
import type { Lang } from "@/types";
import { getT } from "@/lib/i18n";

export function ReviewForm({ serviceId, lang, existing }: { serviceId: string; lang: Lang; existing?: { rating: number; text: string } | null }) {
  const t = getT(lang);
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [text, setText] = useState(existing?.text ?? "");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (pending) return;
    setErr("");
    if (!text.trim()) return;
    setPending(true);
    try {
      const res = await addReview({ serviceId, rating, text });
      if (res.ok) {
        setOk(true);
        setText("");
        setTimeout(() => location.reload(), 700); // revalidate оновить сторінку
        return;
      }
      if (/війти|login|sign in|увійти/i.test(res.error)) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      setErr(res.error);
    } catch {
      setErr("Сталася помилка. Спробуйте ще раз.");
    } finally {
      setPending(false);
    }
  };

  if (ok) return <p className="text-sm text-emerald-700 font-medium p-4 bg-emerald-50 rounded-xl border border-emerald-100">✓ {existing ? t.reviewUpdated : t.reviewThanks}</p>;

  return (
    <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-2">{existing ? t.editReview : t.leaveReview}</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} onClick={() => !pending && setRating(i)} className={cn("w-6 h-6 transition-colors", pending ? "cursor-default" : "cursor-pointer", i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300")} />
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={pending} placeholder={t.shareImpression} rows={3} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-400 text-sm resize-none mb-3 disabled:opacity-60" />
      {err && <p className="text-rose-500 text-xs mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
      <button onClick={submit} disabled={pending} className={cn("bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed", pending && "bg-emerald-600")}>
        {pending && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {existing ? t.saveReview : t.publishReview}
      </button>
    </div>
  );
}
