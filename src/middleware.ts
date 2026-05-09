import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const staffRoutes = ["/staff/dashboard", "/staff/appointments", "/staff/availability"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const platformRole = req.auth?.user?.platformRole;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isStaffRoute = staffRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (platformRole !== "SUPERADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isStaffRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isProtected && isLoggedIn && platformRole === "SUPERADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    if (platformRole === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|api/booking|_next/static|_next/image|favicon.ico).*)"],
};
