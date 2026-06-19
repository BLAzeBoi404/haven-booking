"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePrefs } from "./PrefsProvider";
import { getT } from "@/lib/i18n";

export function Footer() {
  const { lang } = usePrefs();
  const t = getT(lang);

  // Логотип HAVEN робить повний перехід на головну — це скидає поточну
  // сторінку/стан (повне перезавантаження), як і в шапці. Враховуємо вже
  // відкриту головну: тоді просто гортаємо вгору без перезавантаження.
  const goHome = () => {
    if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.href = "/";
  };
  const cols = [
    { head: t.footerCompany, links: [["/about", t.footerAbout], ["/careers", t.footerCareers], ["/blog", t.footerBlog]] },
    { head: t.footerSupport, links: [["/help", t.footerHelp], ["/safety", t.footerSafety], ["/contacts", t.footerContacts]] },
    { head: t.footerLegal, links: [["/privacy", t.footerPrivacy], ["/terms", t.footerTerms]] },
  ];

  return (
    <footer className="bg-emerald-950 text-white py-2.5 mt-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
          <div className="col-span-2 sm:col-span-1">
            <button onClick={goHome} className="flex items-center gap-2 mb-0.5 w-max group" title={t.toHome}>
              <div className="w-4 h-4 bg-emerald-700 group-hover:bg-emerald-600 rounded-md flex items-center justify-center shrink-0 transition-colors">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="display font-bold text-white group-hover:text-emerald-300 transition-colors text-sm">HAVEN</span>
            </button>
            <p className="text-emerald-200/50 text-[10px] leading-snug">{t.tagline}</p>
          </div>
          {cols.map(({ head, links }) => (
            <div key={head}>
              <h4 className="display font-bold text-emerald-400/70 text-[10px] mb-0.5">{head}</h4>
              <ul className="space-y-0">
                {links.map(([href, l]) => (
                  <li key={href}>
                    <Link href={href} className="text-emerald-200/50 hover:text-white text-[11px] transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-emerald-900 pt-1.5 flex flex-col sm:flex-row justify-between items-center gap-1 text-[10px] text-emerald-200/30">
          <span>{t.copyright}</span>
          <span>{t.compliance}</span>
        </div>
      </div>
    </footer>
  );
}
