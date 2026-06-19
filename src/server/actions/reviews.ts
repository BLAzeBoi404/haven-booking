// =====================================================================
//  Reviews Server Action — додавання відгуку клієнтом (§3.3)
// =====================================================================

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireUser, AuthError } from "../auth-guard";
import { reviewSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function addReview(input: unknown) {
  // Лише клієнти (не фахівці) залишають відгуки
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) return { ok: false as const, error: "Увійдіть, щоб залишити відгук." };
    throw e;
  }
  if (user.role === Role.PROVIDER) {
    return { ok: false as const, error: "Фахівці не можуть залишати відгуки." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Перевірте відгук.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { serviceId, rating, text } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { ok: false as const, error: "Послугу не знайдено." };

  // Один клієнт = один відгук на послугу (upsert замість create).
  // Це усуває дублювання при подвійному кліку та гонках.
  const existing = await prisma.review.findUnique({
    where: { serviceId_authorId: { serviceId, authorId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: { rating, text, authorName: user.name },
    });
  } else {
    await prisma.review.create({
      data: {
        serviceId,
        authorId: user.id,
        authorName: user.name,
        rating,
        text,
      },
    });
  }

  // Перерахунок рейтингу послуги
  const agg = await prisma.review.aggregate({
    where: { serviceId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  if (agg._count.rating > 0) {
    await prisma.service.update({
      where: { id: serviceId },
      data: { rating: agg._avg.rating ?? 5 },
    });
  }

  revalidatePath(`/services/${serviceId}`);
  return { ok: true as const, data: null };
}
