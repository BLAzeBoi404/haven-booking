// =====================================================================
//  createBooking — ЯДРО транзакційної цілісності HAVEN (§2.4 / §3.3)
//
//  Вирішує фундаментальну проблему стану гонки (Race Condition):
//  десятки одночасних запитів на один слот → успіх лише для одного.
//
//  Механізм: пессимістичне блокування рядка SELECT ... FOR UPDATE NOWAIT
//  всередині $transaction. Другий паралельний клієнт миттєво отримує
//  помилку блокування від ЯДРА PostgreSQL (не від коду додатку), після
//  чого Server Action повертає { collision: true }, а клієнтський
//  useOptimistic тихо відкочує UI.
// =====================================================================

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireUser, AuthError } from "../auth-guard";
import { bookingSchema } from "@/lib/validations";
import { notifyProvider } from "../email";
import { Role } from "@prisma/client";
import type { BookingItem } from "@/types";

/** Конвертація помилок Zod/валідації у ActionResult. */
function fail(error: string, fieldErrors?: Record<string, string[]>) {
  return { ok: false as const, error, fieldErrors };
}

export async function createBooking(input: unknown) {
  // 1) RBAC — лише авторизований клієнт. AuthError має стати user-facing
  //    ActionResult, а не неопрацьованим 500 (§3.5 / §3.9).
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code === "FORBIDDEN" ? "Доступ заборонено. Увійдіть в систему." : "Необхідно увійти в систему (login), щоб забронювати.");
    }
    throw e;
  }

  // 2) Zod safeParse — жорстка валідація на вході (§3.3)
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Невірні дані бронювання.", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  const { serviceId, providerId, date, time, comment } = parsed.data;

  // 3) Перевірка, що послуга існує і належить цьому фахівцю
  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId },
    include: { provider: true },
  });
  if (!service) return fail("Послугу не знайдено.");

  // 4) Транзакційне ядро — пессимістичне блокування (§3.3)
  try {
    const booking = await prisma.$transaction(async (tx) => {
      // SELECT ... FOR UPDATE NOWAIT — фізична блокування рядка-слота
      // на рівні ядра PostgreSQL. Конкурентна транзакція миттєво падає
      // з помилкою «could not obtain lock on row» (P2034 у Prisma).
      // Примітка: рядок може ще не існувати — тоді блокуємо за умови.
      await tx.$executeRaw`
        SELECT 1 FROM "Booking"
        WHERE "providerId" = ${providerId}
          AND date = ${date}
          AND time = ${time}
        FOR UPDATE NOWAIT`;

      // Якщо FOR UPDATE пройшов без помилки — або слот вільний (0 рядків),
      // або ми захопили лок. Перевіряємо фактичну наявність конфлікту.
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

/** Скасувати бронювання клієнтом. */
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

/** Список бронювань поточного користувача — plain-серіалізований (без Decimal). */
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

