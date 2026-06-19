// =====================================================================
//  ProviderProfileClient — сторінка профілю фахівця.
//  Якщо користувач — власник (PROVIDER), показуємо ProviderEditor (CRUD).
// =====================================================================

"use client";

import { CheckCircle, MapPin, Phone } from "lucide-react";
import { Avatar, Stars } from "./primitives";
import { ProviderEditor } from "./ProviderEditor";
import { usePrefs } from "./PrefsProvider";
import { getT } from "@/lib/i18n";
import { firstImage } from "@/lib/images";
import type { ProviderProfile, ServiceCardItem } from "@/types";
import type { SessionUser } from "@/types";

export function ProviderProfileClient({
  provider,
  services,
  user,
}: {
  provider: ProviderProfile;
  services: ServiceCardItem[];
  user: SessionUser | null;
}) {
  const { lang, currency } = usePrefs();
  const t = getT(lang);
  const isOwner = user?.id === provider.id && user?.role === "PROVIDER";

  return (
    <div className="pt-20 pb-16 fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ліва колонка — картка профілю */}
          <div className="lg:col-span-1">
            <div className="card p-5 text-center sticky top-20">
              <Avatar name={provider.name} size="xl" className="mx-auto mb-4" />
              <h1 className="display font-bold text-gray-900 flex justify-center items-center gap-1.5 text-base mb-0.5">
                {provider.name}
                {provider.verified && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              </h1>
              <p className="text-emerald-700 text-sm font-medium mb-1">{provider.specialization}</p>
              <p className="text-gray-500 text-xs flex justify-center items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{provider.location}</p>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Stars rating={provider.rating} />
                <span className="font-bold text-gray-900 text-sm">{provider.rating.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left mb-4">
                {[
                  [t.experience, provider.experience || "—"],
                  [t.completedJobs, String(provider.completedJobs)],
                  [t.successRate, `${provider.successRate}%`],
                  ["Відгуків", String(provider.reviewsCount)],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="font-bold text-gray-900 text-sm">{val}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {!isOwner && (
                <>
                  {provider.phone && <p className="text-gray-600 text-xs flex items-center justify-center gap-1.5 mb-3"><Phone className="w-3 h-3" />{provider.phone}</p>}
                  {provider.bio && <p className="text-gray-600 text-xs leading-relaxed text-left p-3 bg-gray-50 rounded-lg border border-gray-100">{provider.bio}</p>}
                </>
              )}
            </div>
          </div>

          {/* Права колонка — послуги + редактор (для власника) */}
          <div className="lg:col-span-3">
            {isOwner ? (
              <ProviderEditor
                providerId={provider.id}
                services={services}
                initialBio={provider.bio || ""}
                initialSpecialization={provider.specialization || ""}
                initialPhone={provider.phone || ""}
                lang={lang}
                currency={currency}
              />
            ) : (
              <>
                <h2 className="display font-bold text-gray-900 mb-5">{t.services}</h2>
                {services.length === 0 ? (
                  <div className="card p-12 text-center"><p className="text-gray-500 text-sm">Послуг поки немає.</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((sv) => (
                      <a key={sv.id} href={`/services/${sv.id}`} className="card card-hover overflow-hidden cursor-pointer group">
                        <div className="h-40 overflow-hidden bg-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={firstImage(sv.images, sv.category, hashVariant(sv.id))} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors">{sv.title}</h4>
                          <p className="text-gray-400 text-xs line-clamp-2 mb-2">{sv.description}</p>
                          <p className="display font-bold text-gray-900">{sv.priceUSD}$</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Стабільний «варіант» з id → різні фото в сусідніх карток. */
function hashVariant(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
