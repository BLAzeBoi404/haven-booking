"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { createSession, clearSession, getOrCreateDeviceId } from "../session";
import { registerSchema, loginSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

const ADMIN_EMAIL = "admin@gmail.com";

/** Привʼязати аккаунт до поточного пристрою (асинхронно, без очікування). */
function linkDeviceAccount(userId: string, email: string, name: string, role: string) {
  getOrCreateDeviceId().then((deviceId) =>
    prisma.deviceAccount.upsert({
      where: { deviceId_userId: { deviceId, userId } },
      create: { deviceId, userId, email, name, role },
      update: {},
    }).catch(() => { /* не критично */ }),
  );
}

export async function register(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Перевірте введені дані.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { name, email, password, role, country, city, legalType, taxId } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false as const, error: "Email вже зареєстрований." };

  const passwordHash = await bcrypt.hash(password, 10);
  const finalRole: Role = email === ADMIN_EMAIL ? Role.CLIENT : role;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: finalRole,
      ...(finalRole === Role.PROVIDER && {
        country,
        city,
        location: city,
        legalType,
        taxId,
        specialization: "Різноробочий",
        bio: "Готовий виконати ваше завдання.",
        experience: "Новий фахівець",
      }),
    },
  });

  if (finalRole === Role.PROVIDER) {
    await prisma.service.create({
      data: {
        providerId: user.id,
        title: name,
        description: "Готовий виконати ваше завдання. Звʼяжіться для обговорення деталей.",
        priceUSD: 20,
        category: "Різноробочий",
        images: [],
      },
    });
  }

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  linkDeviceAccount(user.id, user.email, user.name, user.role);
  redirect("/");
}

export async function login(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Невірний email або пароль.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false as const, error: "Невірний email або пароль." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false as const, error: "Невірний email або пароль." };

  if (user.blocked) return { ok: false as const, error: "Акаунт заблоковано адміністратором." };

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  linkDeviceAccount(user.id, user.email, user.name, user.role);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
