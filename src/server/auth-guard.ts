// =====================================================================
//  RBAC — Role-Based Access Control для Server Actions (§3.5 диплома)
//
//  Кожна захищена серверна функція починається з requireUser()/requireRole().
//  Спроба клієнта викликати адміністративну RPC-функцію призводить до
//  жорсткого переривання з помилкою доступу (403).
// =====================================================================

import { getSession } from "./session";
import type { SessionUser } from "@/types";
import { Role } from "@prisma/client";

/** Вимагати авторизованого користувача будь-якої ролі. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new AuthError("Необхідно увійти в систему.", "UNAUTHORIZED");
  }
  return user;
}

/** Вимагати конкретну роль (або одну з переліку). */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("Доступ заборонено.", "FORBIDDEN");
  }
  return user;
}

/** Специфічна помилка авторизації — перехоплюється у wrapper. */
export class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  constructor(message: string, code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(message);
    this.code = code;
  }
}
