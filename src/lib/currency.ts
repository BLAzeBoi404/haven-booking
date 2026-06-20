// =====================================================================
//  Довідник валют (перенесено з прототипу).
// =====================================================================

import type { Currency } from "@/types";
import type { Lang } from "@/types";

export const CURRENCIES: Record<Currency, { sym: string; rate: number }> = {
  UAH: { sym: "₴", rate: 41 },
  USD: { sym: "$", rate: 1 },
  EUR: { sym: "€", rate: 0.92 },
  GBP: { sym: "£", rate: 0.79 },
};

export const CURRENCY_LIST = Object.entries(CURRENCIES).map(([code, c]) => ({
  code: code as Currency,
  sym: c.sym,
}));

export const LANGS = [
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export const COUNTRY_RULES: Record<string, { name: string; types: { v: string; l: string }[]; tax: string }> = {
  UA: { name: "Україна", types: [{ v: "fop", l: "ФОП" }, { v: "tov", l: "ТОВ" }], tax: "ЄДРПОУ / ІПН" },
  PL: { name: "Польща", types: [{ v: "jdg", l: "JDG" }, { v: "sp", l: "Sp. z o.o." }], tax: "NIP" },
  DE: { name: "Німеччина", types: [{ v: "gew", l: "Gewerbebetrieb" }, { v: "gmbh", l: "GmbH" }], tax: "Steuernummer" },
  US: { name: "США", types: [{ v: "sole", l: "Sole Prop." }, { v: "llc", l: "LLC" }], tax: "EIN / SSN" },
};

export const CATEGORIES = [
  "Електрик", "Сантехнік", "Клінінг", "Ремонт ПК", "Фотограф", "Веб-розробник",
  "Дизайнер", "Вантажник", "Юрист", "Перекладач", "Ремонт квартир", "Дизайн інтер'єру",
  "Репетитор", "Масаж", "Різноробочий",
];

export const CAT_CHIP: Record<string, string> = {
  "Електрик": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Сантехнік": "bg-blue-50 text-blue-700 border-blue-200",
  "Клінінг": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Ремонт ПК": "bg-violet-50 text-violet-700 border-violet-200",
  "Фотограф": "bg-pink-50 text-pink-700 border-pink-200",
  "Веб-розробник": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Дизайнер": "bg-purple-50 text-purple-700 border-purple-200",
  "Вантажник": "bg-orange-50 text-orange-700 border-orange-200",
  "Юрист": "bg-gray-50 text-gray-600 border-gray-200",
  "Перекладач": "bg-teal-50 text-teal-700 border-teal-200",
  "Ремонт квартир": "bg-amber-50 text-amber-700 border-amber-200",
  "Дизайн інтер'єру": "bg-rose-50 text-rose-700 border-rose-200",
  "Репетитор": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Масаж": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Різноробочий": "bg-slate-50 text-slate-700 border-slate-200",
};

/** Переклад назв категорій. Ключ — канонічна (українська) назва з БД. */
export const CAT_LABELS: Record<string, { uk: string; en: string }> = {
  "Електрик": { uk: "Електрик", en: "Electrician" },
  "Сантехнік": { uk: "Сантехнік", en: "Plumber" },
  "Клінінг": { uk: "Клінінг", en: "Cleaning" },
  "Ремонт ПК": { uk: "Ремонт ПК", en: "PC Repair" },
  "Фотограф": { uk: "Фотограф", en: "Photographer" },
  "Веб-розробник": { uk: "Веб-розробник", en: "Web Developer" },
  "Дизайнер": { uk: "Дизайнер", en: "Designer" },
  "Вантажник": { uk: "Вантажник", en: "Mover" },
  "Юрист": { uk: "Юрист", en: "Lawyer" },
  "Перекладач": { uk: "Перекладач", en: "Translator" },
  "Ремонт квартир": { uk: "Ремонт квартир", en: "Apartment Renovation" },
  "Дизайн інтер'єру": { uk: "Дизайн інтер'єру", en: "Interior Design" },
  "Репетитор": { uk: "Репетитор", en: "Tutor" },
  "Масаж": { uk: "Масаж", en: "Massage" },
  "Різноробочий": { uk: "Різноробочий", en: "Handyman" },
};

/** Локалізована назва категорії для відображення (фільтрація лишається по канонічному ключу). */
export function categoryLabel(cat: string, lang: Lang): string {
  const entry = CAT_LABELS[cat];
  if (!entry) return cat;
  return lang === "en" ? entry.en : entry.uk;
}
