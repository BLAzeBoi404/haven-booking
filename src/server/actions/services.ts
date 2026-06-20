// =====================================================================
//  Services Server Actions — CRUD послуг фахівця (§3.3)
//  Лише PROVIDER може керувати власними послугами.
// =====================================================================

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireRole } from "../auth-guard";
import { serviceSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function createService(input: unknown) {
  const user = await requireRole(Role.PROVIDER);
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Перевірте дані послуги.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { title, description, priceUSD, images, category } = parsed.data;

  await prisma.service.create({
    data: {
      providerId: user.id,
      title,
      description,
      priceUSD,
      category,
      images,
    },
  });
  revalidatePath(`/providers/${user.id}`);
  revalidatePath("/");
  return { ok: true as const, data: null };
}

export async function updateService(serviceId: string, input: unknown) {
  const user = await requireRole(Role.PROVIDER);
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Перевірте дані послуги.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { title, description, priceUSD, images, category } = parsed.data;

  const owned = await prisma.service.findFirst({ where: { id: serviceId, providerId: user.id } });
  if (!owned) return { ok: false as const, error: "Послугу не знайдено." };

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      title,
      description,
      priceUSD,
      category,
      images,
    },
  });
  revalidatePath(`/providers/${user.id}`);
  revalidatePath("/");
  return { ok: true as const, data: null };
}

export async function deleteService(serviceId: string) {
  const user = await requireRole(Role.PROVIDER);
  const owned = await prisma.service.findFirst({ where: { id: serviceId, providerId: user.id } });
  if (!owned) return { ok: false as const, error: "Послугу не знайдено." };
  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath(`/providers/${user.id}`);
  revalidatePath("/");
  return { ok: true as const, data: null };
}

export async function updateProviderProfile(input: unknown) {
  const user = await requireRole(Role.PROVIDER);
  const { providerProfileSchema } = await import("@/lib/validations");
  const parsed = providerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Перевірте дані профілю.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { bio, specialization, phone } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: { bio, specialization, phone },
  });
  revalidatePath(`/providers/${user.id}`);
  return { ok: true as const, data: null };
}
