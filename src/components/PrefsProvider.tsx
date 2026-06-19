// =====================================================================
//  PrefsProvider — клієнтський провайдер стану мови/валюти.
//  Читає з cookie (поставлених layout), дозволяє Header змінювати
//  і зберігає вибір назад у cookie через Server Action.
// =====================================================================

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { setPrefs } from "@/server/actions/prefs";
import type { Lang, Currency } from "@/types";

interface PrefsCtx {
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
}

const Ctx = createContext<PrefsCtx | null>(null);

export function PrefsProvider({ lang, currency, children }: { lang: Lang; currency: Currency; children: ReactNode }) {
  const [l, setL] = useState<Lang>(lang);
  const [c, setC] = useState<Currency>(currency);

  const setLang = (next: Lang) => { setL(next); setPrefs("lang", next); };
  const setCurrency = (next: Currency) => { setC(next); setPrefs("currency", next); };

  return <Ctx.Provider value={{ lang: l, currency: c, setLang, setCurrency }}>{children}</Ctx.Provider>;
}

export function usePrefs(): PrefsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}
