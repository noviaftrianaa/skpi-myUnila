import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type UserRole = "admin" | "mahasiswa" | "dosen";

interface RoleConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// Role configuration for each route pattern
const roleRoutes: Record<string, RoleConfig> = {
  "/dashboard/siakadu/admin": {
    allowedRoles: ["admin"],
    redirectTo: "/portal",
  },
  "/dashboard/siakadu/mahasiswa": {
    allowedRoles: ["mahasiswa"],
    redirectTo: "/portal",
  },
  "/dashboard/siakadu/dosen": {
    allowedRoles: ["dosen"],
    redirectTo: "/portal",
  },
};

/**
 * Check if user has permission to access a route based on their role
 */
export function checkRoleAccess(
  pathname: string,
  userRole: UserRole | null
): { allowed: boolean; redirectTo?: string } {
  // Find matching route configuration
  const matchedRoute = Object.keys(roleRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    // No role restriction for this route
    return { allowed: true };
  }

  const config = roleRoutes[matchedRoute];

  if (!userRole) {
    // User not authenticated
    return {
      allowed: false,
      redirectTo: "/auth/login",
    };
  }

  if (!config.allowedRoles.includes(userRole)) {
    // User doesn't have required role
    return {
      allowed: false,
      redirectTo: config.redirectTo || "/portal",
    };
  }

  return { allowed: true };
}

/**
 * Middleware function to check role-based access
 * This can be used in Next.js middleware or in server components
 */
export function roleMiddleware(request: NextRequest, userRole: UserRole | null) {
  const { pathname } = request.nextUrl;

  const { allowed, redirectTo } = checkRoleAccess(pathname, userRole);

  if (!allowed && redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

/**
 * Client-side hook to check if user can access a route
 */
export function useRoleAccess(pathname: string, userRole: UserRole | null) {
  return checkRoleAccess(pathname, userRole);
}
