// =====================================================================
//  Server-side queries HAVEN.
//  УСІ дані, що йдуть у клієнтські компоненти, проходять серіалізацію:
//  Decimal → number. Це прибирає помилку RSC «Decimal objects are not
//  supported» та гарантує, що до клієнта не витікають passwordHash тощо.
// =====================================================================

import { prisma } from "./db";
import { getSession } from "./session";
import { unstable_cache } from "next/cache";
import type {
  ServiceWithProvider,
  ServiceDetail,
  ProviderProfile,
  ServiceCardItem,
  ProviderSummary,
  ReviewItem,
} from "@/types";

// --- Локальні інтерфейси (уже без Decimal) --------------------------------
// Залишені для зворотної сумісності зі старими імпортами — делегують до
// канонічних типів у src/types.
export type { ServiceDetail, ProviderProfile };

export interface ProviderWithServices extends ProviderProfile {}

/** Конвертор відгуку → plain-обʼєкт. */
function toReview(r: {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: Date;
}): ReviewItem {
  return { id: r.id, authorName: r.authorName, rating: Number(r.rating), text: r.text, createdAt: r.createdAt };
}

/** Конвертор послуги-картки → plain. */
function toServiceCard(s: {
  id: string;
  title: string;
  description: string;
  priceUSD: unknown;
  category: string;
  images: string[];
  rating: unknown;
}): ServiceCardItem {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    priceUSD: Number(s.priceUSD),
    category: s.category,
    images: s.images,
    rating: Number(s.rating),
  };
}

/** Конвертор фахівця (User) → ProviderSummary без passwordHash. */
function toProviderSummary(p: {
  id: string;
  name: string;
  specialization: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  verified: boolean;
  rating: unknown;
  completedJobs: number;
  reviewsCount: number;
  successRate: number;
  experience: string | null;
}): ProviderSummary {
  return {
    id: p.id,
    name: p.name,
    specialization: p.specialization,
    bio: p.bio,
    phone: p.phone,
    location: p.location,
    country: p.country,
    city: p.city,
    verified: p.verified,
    rating: Number(p.rating),
    completedJobs: p.completedJobs,
    reviewsCount: p.reviewsCount,
    successRate: p.successRate,
    experience: p.experience,
  };
}

export const getServicesWithProviders = unstable_cache(
  async (): Promise<ServiceWithProvider[]> => {
    const services = await prisma.service.findMany({
      where: { hidden: false },
      // Тягнемо лише потрібні поля провайдера (без passwordHash, taxId тощо) —
      // менший payload з віддаленої БД Supabase.
      include: {
        provider: {
          select: { name: true, location: true, verified: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      priceUSD: Number(s.priceUSD),
      category: s.category,
      images: s.images,
      rating: Number(s.rating),
      providerId: s.providerId,
      providerName: s.provider.name,
      providerLocation: s.provider.location ?? "—",
      providerVerified: s.provider.verified,
    }));
  },
  ["services-catalog"],
  { revalidate: 300 } // 5 хвилин — каталог майже статичний; інвалідується revalidatePath
);

export const getServiceDetail = unstable_cache(
  async (id: string): Promise<ServiceDetail | null> => {
    const s = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
        reviews: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!s) return null;
    if (s.hidden) {
      const viewer = await getSession();
      if (!viewer || viewer.role !== "ADMIN") return null;
    }
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      priceUSD: Number(s.priceUSD),
      category: s.category,
      images: s.images,
      rating: Number(s.rating),
      providerId: s.providerId,
      provider: toProviderSummary(s.provider),
      reviews: s.reviews.map(toReview),
    };
  },
  ["service-detail"],
  { revalidate: 300 }
);

export async function getProviderProfile(id: string): Promise<ProviderProfile | null> {
  const p = await prisma.user.findUnique({
    where: { id },
    include: { services: { orderBy: { createdAt: "desc" } } },
  });
  if (!p) return null;
  return {
    ...toProviderSummary(p),
    email: p.email,
    role: p.role,
    services: p.services.map(toServiceCard),
  };
}

export async function getAllProviders() {
  const list = await prisma.user.findMany({
    where: { role: "PROVIDER" },
    orderBy: { createdAt: "desc" },
    include: { services: { select: { id: true } } },
  });
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    specialization: p.specialization ?? "—",
    location: p.location ?? "—",
    verified: p.verified,
    blocked: p.blocked,
    rating: Number(p.rating),
    completedJobs: p.completedJobs,
    reviewsCount: p.reviewsCount,
    successRate: p.successRate,
    servicesCount: p.services.length,
    createdAt: p.createdAt,
  }));
}

export async function getAllBookings() {
  const list = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { provider: { select: { name: true } }, client: { select: { name: true, email: true } } },
  });
  return list.map((b) => ({
    id: b.id,
    serviceName: b.serviceName,
    providerId: b.providerId,
    providerName: b.provider?.name ?? b.providerName,
    clientId: b.clientId,
    clientName: b.client?.name ?? "—",
    clientEmail: b.client?.email ?? "—",
    date: b.date,
    time: b.time,
    priceUSD: Number(b.priceUSD),
    status: b.status,
    createdAt: b.createdAt,
  }));
}

export async function getCurrentUser() {
  return getSession();
}

export async function getUsersCount() {
  const [clients, providers, admins, total] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count(),
  ]);
  return { clients, providers, admins, total };
}

export async function getAllUsers() {
  const list = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { services: { select: { id: true } } },
  });
  return list.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    blocked: u.blocked,
    verified: u.verified,
    location: u.location ?? "—",
    specialization: u.specialization ?? null,
    createdAt: u.createdAt,
    servicesCount: u.services.length,
  }));
}

export async function getAllServices() {
  const list = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { provider: { select: { name: true } } },
  });
  return list.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    priceUSD: Number(s.priceUSD),
    category: s.category,
    hidden: s.hidden,
    rating: Number(s.rating),
    providerId: s.providerId,
    providerName: s.provider?.name ?? "—",
    createdAt: s.createdAt,
  }));
}
