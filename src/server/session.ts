// =====================================================================
//  Stateless-авторизація на базі JWT (§3.5 диплома)
//
//  Сервер криптографічно підписує payload через бібліотеку jose (працює
//  на Edge-runtime, тобто у middleware.ts). Токен зберігається у
//  http-only + Secure cookie — фізично недоступний клієнтському JS,
//  що ліквідує вектор XSS. Жодного звернення до Redis/БД при кожному запиті.
// =====================================================================

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";
import { prisma } from "./db";

const COOKIE_NAME = "haven_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 днів

const secretKey = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-insecure-secret-change-me");

export interface SessionPayload extends JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: SessionUser["role"];
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Отримати сесію з cookie (серверна частина, Node.js). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const p = payload as SessionPayload;
    const row = await prisma.user.findUnique({ where: { id: p.sub }, select: { blocked: true } });
    if (row?.blocked) {
      store.delete(COOKIE_NAME);
      return null;
    }
    return { id: p.sub, email: p.email, name: p.name, role: p.role };
  } catch {
    return null;
  }
}

/** Видалити сесію (logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Верифікувати «сирий» рядок токена — для Edge middleware (без next/headers). */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const p = payload as SessionPayload;
    return { id: p.sub, email: p.email, name: p.name, role: p.role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
const DEVICE_COOKIE = "haven_device";

/** Отримати або створити ID пристрою (httpOnly cookie, 30 днів).
 *  Використовується для привʼязки кількох аккаунтів до одного браузера. */
export async function getOrCreateDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return id;
}
