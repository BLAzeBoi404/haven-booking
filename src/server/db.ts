// =====================================================================
//  PrismaClient Singleton — §3.2 диплома
//
//  Проблема: у середовищі Next.js Fast Refresh постійно інвалідує кеш
//  модулів Node.js. Без цього патерну створюються сотні паралельних
//  екземплярів PrismaClient, що вичерпують ліміт TCP-з'єднань БД (§3.2).
//
//  Рішення: єдиний екземпляр зберігається в globalThis — переживає HMR.
// =====================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
