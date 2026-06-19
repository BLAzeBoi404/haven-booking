"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireRole } from "../auth-guard";
import { Role, BookingStatus } from "@prisma/client";

export async function getAdminStats() {
  await requireRole(Role.ADMIN);

  const [total, confirmed, cancelled, providers, clients, confirmedBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    prisma.booking.count({
      where: { status: { in: [BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN] } },
    }),
    prisma.user.count({ where: { role: Role.PROVIDER } }),
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED },
      select: { priceUSD: true },
    }),
  ]);

  const revenue = confirmedBookings.reduce((sum, b) => sum + Number(b.priceUSD), 0);

  return { total, confirmed, cancelled, providers, clients, revenue };
}

export async function adminForceCancel(bookingId: string) {
  await requireRole(Role.ADMIN);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED_ADMIN },
  });
  revalidatePath("/admin");
  return { ok: true as const, data: { id: bookingId } };
}

export async function toggleProviderVerification(providerId: string) {
  await requireRole(Role.ADMIN);
  const provider = await prisma.user.findUnique({ where: { id: providerId } });
  if (!provider) return { ok: false as const, error: "Фахівця не знайдено." };
  await prisma.user.update({
    where: { id: providerId },
    data: { verified: !provider.verified },
  });
  revalidatePath("/admin");
  return { ok: true as const, data: { id: providerId } };
}

export async function adminToggleUserBlocked(userId: string) {
  await requireRole(Role.ADMIN);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "Користувача не знайдено." };
  if (user.role === Role.ADMIN) return { ok: false as const, error: "Адміністратора не можна заблокувати." };
  await prisma.user.update({
    where: { id: userId },
    data: { blocked: !user.blocked },
  });
  revalidatePath("/admin");
  return { ok: true as const, data: { id: userId } };
}

export async function adminChangeUserRole(userId: string, role: "CLIENT" | "PROVIDER") {
  await requireRole(Role.ADMIN);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "Користувача не знайдено." };
  if (user.role === Role.ADMIN) return { ok: false as const, error: "Роль адміністратора не змінюється." };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
  return { ok: true as const, data: { id: userId } };
}

export async function adminDeleteUser(userId: string) {
  await requireRole(Role.ADMIN);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "Користувача не знайдено." };
  if (user.role === Role.ADMIN) return { ok: false as const, error: "Адміністратора не можна видалити." };
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const, data: { id: userId } };
}

export async function adminToggleServiceHidden(serviceId: string) {
  await requireRole(Role.ADMIN);
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { ok: false as const, error: "Послугу не знайдено." };
  await prisma.service.update({
    where: { id: serviceId },
    data: { hidden: !service.hidden },
  });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const, data: { id: serviceId } };
}

export async function adminDeleteService(serviceId: string) {
  await requireRole(Role.ADMIN);
  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const, data: { id: serviceId } };
}
