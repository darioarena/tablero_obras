import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const FALLBACK_SECRET = "portal-de-obras-super-secret-production-key-2024-32chars";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Control de acceso por rol: Solo ADMIN puede acceder a usuarios y diagnóstico de Sheets
    const adminRestricted = ["/dashboard/usuarios", "/dashboard/sheets"];
    if (adminRestricted.some((route) => pathname.startsWith(route)) && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?access_denied=admin_only", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || FALLBACK_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
