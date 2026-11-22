import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

export const proxy = auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isAuthenticated = Boolean(req.auth);

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    isAuthenticated &&
    pathname.startsWith("/users") &&
    !hasPermission(req.auth?.user?.role, "users:manage")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
