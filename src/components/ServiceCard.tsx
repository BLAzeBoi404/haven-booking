import Link from "next/link";
import { Star, MapPin, ShieldCheck, ArrowRight, ImageIcon } from "lucide-react";
import { cn, convertPrice, currencySymbol } from "@/lib/utils";
import { Chip } from "./primitives";
import { firstImage } from "@/lib/images";
import type { ServiceWithProvider, Lang, Currency } from "@/types";
import { getT } from "@/lib/i18n";

export function ServiceCard({ s, lang, currency }: { s: ServiceWithProvider; lang: Lang; currency: Currency }) {
  const t = getT(lang);
  const sym = currencySymbol(currency);
  const price = convertPrice(s.priceUSD, currency);
  const img = firstImage(s.images, s.category, hashVariant(s.id));
  const hasImage = !!img;

  return (
    <Link href={`/services/${s.id}`} className="card card-hover overflow-hidden cursor-pointer group flex flex-col block">
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "16/10" }}>
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {s.reviewsCount > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{s.rating}
          </div>
        )}
        {s.providerVerified && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-white text-emerald-700 text-xs font-semibold px-1.5 py-0.5 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3 h-3 inline" />
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-2 w-max">
          <MapPin className="w-3 h-3" />{s.providerLocation}
          <Chip cat={s.category} className="ml-1.5" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-1 group-hover:text-emerald-700 transition-colors">{s.title}</h3>
        <p className={cn("text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3")}>{s.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">{t.fromPrice} </span>
            <span className="display font-bold text-gray-900">{sym}{price}</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Стабільний «варіант» з id → різні фото в сусідніх карток тієї ж категорії. */
function hashVariant(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
