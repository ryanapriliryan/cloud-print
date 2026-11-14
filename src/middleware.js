import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("cloud_print_session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/pelanggan")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "PELANGGAN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/pelanggan/dashboard", request.url));
    }
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    const dest = session.role === "ADMIN" ? "/admin/dashboard" : "/pelanggan/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pelanggan/:path*", "/admin/:path*", "/login", "/register"],
};
