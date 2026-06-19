// =====================================================================
//  Утиліти HAVEN.
//  cn() — §3.6 диплома: математичне вирішення конфліктів каскаду Tailwind
//  через tailwind-merge (bg-blue-500 + bg-red-500 → залишає лише останній).
// =====================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Currency } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Перша літера (для аватара). */
export function initials(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

/** Конвертація ціни з USD у відображувану валюту. */
export function convertPrice(priceUSD: number, currency: Currency): number {
  const rate: Record<Currency, number> = { UAH: 41, USD: 1, EUR: 0.92, GBP: 0.79 };
  return Math.round(priceUSD * rate[currency]);
}

/** Символ валюти. */
export function currencySymbol(currency: Currency): string {
  const sym: Record<Currency, string> = { UAH: "₴", USD: "$", EUR: "€", GBP: "£" };
  return sym[currency];
}
