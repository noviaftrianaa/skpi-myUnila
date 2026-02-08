"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/middleware/roleMiddleware";

/**
 * Hook to guard routes based on user role
 * Redirects user if they don't have the required role
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // User not authenticated, redirect to login
      router.push("/login");
      return;
    }

    // Map user role to UserRole type
    const userRole = mapUserRole(user.role);

    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role, redirect to portal
      router.push("/portal");
    }
  }, [user, isLoading, allowedRoles, router]);

  return { user, isLoading };
}

/**
 * Map database role to UserRole type
 */
function mapUserRole(role: string | null): UserRole | null {
  if (!role) return null;

  const roleLower = role.toLowerCase();

  // Map common role names to UserRole
  if (roleLower.includes("admin")) return "admin";
  if (roleLower.includes("mahasiswa") || roleLower.includes("student"))
    return "mahasiswa";
  if (roleLower.includes("dosen") || roleLower.includes("lecturer"))
    return "dosen";

  return null;
}

/**
 * Get user role as UserRole type
 */
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return mapUserRole(user?.role || null);
}
