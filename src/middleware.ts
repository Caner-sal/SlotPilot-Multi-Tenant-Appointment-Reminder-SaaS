import { auth } from "@/lib/auth";
import { localeCookieName } from "@/i18n/locales";
import { extractLocale, withLocale } from "@/i18n/pathing";
import {
  getCountryCodeFromHeaders,
  resolveRequestLocale,
} from "@/i18n/request-locale";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const staffRoutes = ["/staff/dashboard", "/staff/appointments", "/staff/availability"];
const authRoutes = ["/login", "/register"];
const publicFilePattern = /\.[^/]+$/;

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const { locale, internalPath } = extractLocale(pathname);
  const countryCode = getCountryCodeFromHeaders(req.headers);

  if (
    internalPath.startsWith("/api") ||
    internalPath.startsWith("/_next") ||
    internalPath === "/favicon.ico" ||
    publicFilePattern.test(internalPath)
  ) {
    return NextResponse.next();
  }

  if (!locale) {
    const resolved = resolveRequestLocale({
      cookieLocale: req.cookies.get(localeCookieName)?.value,
      userPreferredLocale: req.auth?.user?.preferredLocale,
      countryCode,
      acceptLanguage: req.headers.get("accept-language"),
    });
    const url = req.nextUrl.clone();
    url.pathname = withLocale(pathname, resolved.locale);
    const response = NextResponse.redirect(url);
    response.cookies.set(localeCookieName, resolved.locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.headers.set("x-app-locale-source", resolved.source);
    if (countryCode) {
      response.headers.set("x-app-country-code", countryCode);
    }
    return response;
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
  requestHeaders.set("x-app-locale-source", "route");
  if (countryCode) {
    requestHeaders.set("x-app-country-code", countryCode);
  }

  const response =
    internalPath === pathname
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.rewrite(new URL(`${internalPath}${search}`, req.url), {
          request: { headers: requestHeaders },
        });

  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  response.headers.set("x-app-locale-source", "route");
  if (countryCode) {
    response.headers.set("x-app-country-code", countryCode);
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

