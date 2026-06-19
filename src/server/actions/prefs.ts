// =====================================================================
//  Prefs Server Action — збереження мови/валюти у cookie.
// =====================================================================

"use server";

import { cookies } from "next/headers";

export async function setPrefs(key: "lang" | "currency", value: string) {
  const store = await cookies();
  store.set(`haven_${key}`, value, {
    httpOnly: false, // мова/валюта читаються і layout
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function getPrefsFromCookies() {
  const store = await cookies();
  return {
    lang: (store.get("haven_lang")?.value as "uk" | "en") ?? "uk",
    currency: (store.get("haven_currency")?.value as "UAH" | "USD" | "EUR" | "GBP") ?? "UAH",
  };
}
