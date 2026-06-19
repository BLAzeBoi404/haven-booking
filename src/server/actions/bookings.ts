
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireUser, AuthError } from "../auth-guard";
import { bookingSchema } from "@/lib/validations";
import { notifyProvider } from "../email";
import { Role } from "@prisma/client";
import type { BookingItem } from "@/types";

function fail(error: string, fieldErrors?: Record<string, string[]>) {
  return { ok: false as const, error, fieldErrors };
}

export async function createBooking(input: unknown) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code === "FORBIDDEN" ? "Доступ заборонено. Увійдіть в систему." : "Необхідно увійти в систему (login), щоб забронювати.");
    }
    throw e;
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Невірні дані бронювання.", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  const { serviceId, providerId, date, time, comment } = parsed.data;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId },
    include: { provider: true },
  });
  if (!service) return fail("Послугу не знайдено.");

  try {
    const booking = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT 1 FROM "Booking"
        WHERE "providerId" = ${providerId}
          AND date = ${date}
          AND time = ${time}
        FOR UPDATE NOWAIT`;
      const existing = await tx.booking.findUnique({
        where: { providerId_date_time: { providerId, date, time } },
        select: { id: true },
      });
      if (existing) throw new Error("COLLISION");

      const created = await tx.booking.create({
        data: {
          clientId: user.id,
          providerId,
          serviceId,
          serviceName: service.title,
          providerName: service.provider.name,
          date,
          time,
          comment: comment || null,
          priceUSD: service.priceUSD,
        },
      });
      return created;
    });

    await notifyProvider({
      providerEmail: service.provider.email,
      providerName: service.provider.name,
      clientName: user.name,
      serviceName: service.title,
      date,
      time,
      comment: comment || undefined,
    });

    revalidatePath("/bookings");
    return { ok: true as const, data: { id: booking.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Помилка";
    if (msg === "COLLISION" || msg.includes("could not obtain lock") 
      || msg.includes("P2034") || msg.includes("Unique constraint")) {
      return { ok: false as const, error: "Слот перехоплено конкурентною транзакцією.", collision: true };
    }
    return fail("Не вдалося створити бронювання.");
  }
}

export async function cancelBooking(bookingId: string) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) return fail("Необхідно увійти в систему.");
    throw e;
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return fail("Бронювання не знайдено.");
  if (booking.clientId !== user.id && user.role !== Role.ADMIN) {
    return fail("Немає прав на скасування.");
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: user.role === Role.ADMIN ? "CANCELLED_ADMIN" : "CANCELLED_USER" },
  });
  revalidatePath("/bookings");
  return { ok: true as const, data: { id: bookingId } };
}

export async function getMyBookings(): Promise<BookingItem[]> {
  const user = await requireUser();
  const list = await prisma.booking.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return list.map((b) => ({
    id: b.id,
    serviceName: b.serviceName,
    providerId: b.providerId,
    providerName: b.providerName,
    clientId: b.clientId,
    date: b.date,
    time: b.time,
    comment: b.comment,
    priceUSD: Number(b.priceUSD),
    status: b.status,
    createdAt: b.createdAt,
  }));
}

