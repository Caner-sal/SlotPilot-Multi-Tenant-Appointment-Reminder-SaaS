import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { defaultLocale, isAppLocale, localeCookieName } from "@/i18n/locales";
import { extractLocale, withLocale } from "@/i18n/pathing";

const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const staffRoutes = ["/staff/dashboard", "/staff/appointments", "/staff/availability"];
const authRoutes = ["/login", "/register"];
const publicFilePattern = /\.[^/]+$/;

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const { locale, internalPath } = extractLocale(pathname);

  if (
    internalPath.startsWith("/api") ||
    internalPath.startsWith("/_next") ||
    internalPath === "/favicon.ico" ||
    publicFilePattern.test(internalPath)
  ) {
    return NextResponse.next();
  }

  if (!locale) {
    const cookieLocale = req.cookies.get(localeCookieName)?.value;
    const fallbackLocale = isAppLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = withLocale(pathname, fallbackLocale);
    return NextResponse.redirect(url);
  }

  const isLoggedIn = !!req.auth;
  const platformRole = req.auth?.user?.platformRole;

  const isProtected = protectedRoutes.some((r) => internalPath.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => internalPath.startsWith(r));
  const isStaffRoute = staffRoutes.some((r) => internalPath.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => internalPath.startsWith(r));

  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL(withLocale("/login", locale), req.url));
    if (platformRole !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(withLocale("/dashboard", locale), req.url));
    }
  }

  if (isStaffRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL(withLocale("/login", locale), req.url));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL(withLocale("/login", locale), req.url));
  }

  if (isProtected && isLoggedIn && platformRole === "SUPERADMIN") {
    return NextResponse.redirect(new URL(withLocale("/admin", locale), req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    if (platformRole === "SUPERADMIN") {
      return NextResponse.redirect(new URL(withLocale("/admin", locale), req.url));
    }
    return NextResponse.redirect(new URL(withLocale("/dashboard", locale), req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-app-locale", locale);

  const response =
    internalPath === pathname
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.rewrite(new URL(`${internalPath}${search}`, req.url), {
          request: { headers: requestHeaders }
        });

  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
