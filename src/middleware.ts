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

function resolveRequestId(headers: Headers): string {
  const existing = headers.get("x-request-id");
  if (existing && existing.trim().length > 0) return existing;
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}`;
  }
}

function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set("x-request-id", requestId);
  return response;
}

const countryPreferenceCookie = "randevo_country";
const localeSourceCookie = "randevo_locale_source";

function setPreferenceCookies(
  response: NextResponse,
  countryCode: string | null,
  source: string,
): void {
  if (countryCode) {
    response.cookies.set(countryPreferenceCookie, countryCode, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  response.cookies.set(localeSourceCookie, source, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const { locale, internalPath } = extractLocale(pathname);
  const rawCountryCode = getCountryCodeFromHeaders(req.headers);
  const isManualLocale = req.cookies.get(localeSourceCookie)?.value === "manual";
  const countryCode = isManualLocale ? null : rawCountryCode;
  const requestId = resolveRequestId(req.headers);

  if (
    internalPath.startsWith("/api") ||
    internalPath.startsWith("/_next") ||
    internalPath === "/favicon.ico" ||
    publicFilePattern.test(internalPath)
  ) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);
    return withRequestId(NextResponse.next({ request: { headers: requestHeaders } }), requestId);
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
    setPreferenceCookies(response, rawCountryCode, resolved.source);
    response.headers.set("x-app-locale-source", resolved.source);
    if (rawCountryCode) {
      response.headers.set("x-app-country-code", rawCountryCode);
    }
    return withRequestId(response, requestId);
  }

  const isLoggedIn = !!req.auth;
  const platformRole = req.auth?.user?.platformRole;
  const appRole = req.auth?.user?.appRole;

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

  if (isProtected && isLoggedIn && appRole === "STAFF_MEMBER") {
    return NextResponse.redirect(new URL(withLocale("/staff/dashboard", locale), req.url));
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
  requestHeaders.set("x-request-id", requestId);
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
  if (!isManualLocale) {
    setPreferenceCookies(response, rawCountryCode, "route");
  }
  response.headers.set("x-app-locale-source", "route");
  if (rawCountryCode) {
    response.headers.set("x-app-country-code", rawCountryCode);
  }

  return withRequestId(response, requestId);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
