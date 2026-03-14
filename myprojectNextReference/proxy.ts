import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  adminRoutes,
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  userRoutes,
} from "./routes";

export async function proxy(request: NextRequest) {
  // Try to get session from headers for the edge/proxy
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Extract the role safely if the session exists
  const role = session?.user?.role as "admin" | "user" | undefined;

  const { nextUrl } = request;
  const isLoggedIn = !!session;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Basic substring matches for nested routes
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isUserRoute = userRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectPath = role
        ? DEFAULT_LOGIN_REDIRECT[role] || "/user"
        : "/user";
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/not-found", nextUrl));
  }

  if (isUserRoute && role !== "user") {
    // If an admin tries to access /user it may be allowed or not.
    // In strict RBAC, admins stay out of user unless explicitly permitted.
    // If you want admins to also see /user, you could do: role !== "user" && role !== "admin"
    return NextResponse.redirect(new URL("/not-found", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
