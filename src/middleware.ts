import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/server/session";

const ROLE = { ADMIN: "ADMIN", PROVIDER: "PROVIDER", CLIENT: "CLIENT" } as const;
const PROTECTED = ["/bookings", "/dashboard"];
const ADMIN_ONLY = ["/admin"];
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
