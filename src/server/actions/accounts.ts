// =====================================================================
//  Device Accounts Server Actions — швидке перемикання між профілями.
//  Дозволяє переключитися між аккаунтами, раніше привʼязаними
//  до цього пристрою (браузера) без повторного вводу пароля.
// =====================================================================

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { createSession, getOrCreateDeviceId, getSession } from "../session";

export interface LinkedAccount {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Отримати список привʼязаних до пристрою аккаунтів (крім поточного). */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
  const deviceId = await getOrCreateDeviceId();
  const rows = await prisma.deviceAccount.findMany({
    where: { deviceId },
    orderBy: { lastUsedAt: "desc" },
    select: { userId: true, email: true, name: true, role: true },
  });
  return rows.map((r) => ({ id: r.userId, email: r.email, name: r.name, role: r.role }));
}

/** Переключитися на інший привʼязаний аккаунт. */
export async function switchAccount(targetUserId: string): Promise<{ ok: boolean; error?: string }> {
  const deviceId = await getOrCreateDeviceId();
  const current = await getSession();

  // Не можна переключитися на самого себе
  if (current && current.id === targetUserId) {
    return { ok: true };
  }

  // Перевіряємо, що цей аккаунт привʼязаний до поточного пристрою
  const link = await prisma.deviceAccount.findUnique({
    where: { deviceId_userId: { deviceId, userId: targetUserId } },
  });

  if (!link) {
    return { ok: false, error: "Акаунт не привʼязаний до цього пристрою." };
  }

  // Перевіряємо, що користувач існує і не заблокований
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, name: true, role: true, blocked: true },
  });

  if (!user || user.blocked) {
    return { ok: false, error: "Акаунт недоступний." };
  }

  // Оновлюємо lastUsedAt і створюємо нову сесію
  await prisma.deviceAccount.update({
    where: { deviceId_userId: { deviceId, userId: targetUserId } },
    data: {},
  });

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  revalidatePath("/");
  return { ok: true };
}

/** Відвʼязати аккаунт від пристрою (для dropdown-меню). */
export async function unlinkAccount(userId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  await prisma.deviceAccount.deleteMany({
    where: { deviceId, userId },
  });
}
