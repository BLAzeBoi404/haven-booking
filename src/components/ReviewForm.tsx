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

export function ReviewForm({ serviceId, lang }: { serviceId: string; lang: Lang }) {
  const t = getT(lang);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async () => {
    setErr("");
    if (!text.trim()) return;
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
    }
  };

  if (ok) return <p className="text-sm text-emerald-700 font-medium p-4 bg-emerald-50 rounded-xl border border-emerald-100">✓ Дякуємо за відгук!</p>;

  return (
    <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-2">{t.leaveReview}</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} onClick={() => setRating(i)} className={cn("w-6 h-6 cursor-pointer transition-colors", i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300")} />
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.shareImpression} rows={3} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-400 text-sm resize-none mb-3" />
      {err && <p className="text-rose-500 text-xs mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
      <button onClick={submit} className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">{t.publishReview}</button>
    </div>
  );
}
