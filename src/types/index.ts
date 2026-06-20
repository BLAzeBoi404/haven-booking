// =====================================================================
//  Спільні типи HAVEN. Naskрізна TypeScript-типізація — §2.3 / §2.5.
//  Усі «сирові» Prisma-типи (з Decimal/Date) тут НЕ використовуються:
//  серверні query-функції серіалізують Decimal → number, тож клієнтські
//  компоненти отримують виключно plain-обʼєкти (RSC-safe).
// =====================================================================

import type { Role, BookingStatus } from "@prisma/client";

/** Дані користувача, доступні клієнтському UI (без пароля). */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Мова інтерфейсу (uk/en). */
export type Lang = "uk" | "en";

/** Валюта відображення цін. */
export type Currency = "UAH" | "USD" | "EUR" | "GBP";

/** Уніфікована відповідь Server Action. */
export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; collision?: boolean };

/** Картка послуги з даними фахівця (для каталогу). */
export interface ServiceWithProvider {
  id: string;
  title: string;
  description: string;
  priceUSD: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  providerId: string;
  providerName: string;
  providerLocation: string;
  providerVerified: boolean;
}

/** Анотація фахівця — лише потрібні клієнту поля, без passwordHash. */
export interface ProviderSummary {
  id: string;
  name: string;
  specialization: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  verified: boolean;
  rating: number;
  completedJobs: number;
  reviewsCount: number;
  successRate: number;
  experience: string | null;
  workingHours: string;
}

/** Один відгук (plain-серіалізований). */
export interface ReviewItem {
  id: string;
  authorId: string | null;
  authorName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

/** Деталі послуги (сторінка /services/[id]). */
export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  priceUSD: number;
  category: string;
  images: string[];
  rating: number;
  providerId: string;
  provider: ProviderSummary;
  reviews: ReviewItem[];
}

/** Коротка картка послуги всередині профілю фахівця. */
export interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  priceUSD: number;
  category: string;
  images: string[];
  rating: number;
}

/** Профіль фахівця зі списком його послуг (сторінка /providers/[id]). */
export interface ProviderProfile extends ProviderSummary {
  email: string;
  role: Role;
  services: ServiceCardItem[];
}

/** Бронювання — plain-серіалізований запис (для клієнтських списків). */
export interface BookingItem {
  id: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  date: string;
  time: string;
  comment: string | null;
  priceUSD: number;
  status: BookingStatus;
  createdAt: Date;
}
