// =====================================================================
//  Edge Middleware — відсіювання неавторизованого трафіку (§3.5 диплома)
//
//  Розгортається на Edge Network (тисячі міні-серверів по всьому світу).
//  Перехоплює запит, перевіряє криптографічний підпис JWT і приймає
//  рішення про маршрутизацію ЗА МІЛІСЕКУНДИ — ДО того, як запит
//  досягне обчислювального кластера Node.js. Економить серверні ресурси.
// =====================================================================

import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/server/session";

// Значення ролей як рядкові літерали (уникаємо імпорту @prisma/client у Edge-бандлі).
// Збігаються зі значеннями enum Role у schema.prisma.
const ROLE = { ADMIN: "ADMIN", PROVIDER: "PROVIDER", CLIENT: "CLIENT" } as const;

// Шляхи, що вимагають авторизацію (будь-яку роль)
const PROTECTED = ["/bookings", "/dashboard"];
// Шляхи лише для адміністратора
const ADMIN_ONLY = ["/admin"];
// Шляхи лише для фахівців
const PROVIDER_ONLY = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;

  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (user.role !== ROLE.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (PROVIDER_ONLY.some((p) => pathname.startsWith(p)) && user && user.role !== ROLE.PROVIDER) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Обмеження matcher — middleware не працює для статики/API-роутів
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
