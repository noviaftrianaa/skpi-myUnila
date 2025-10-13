/**
 * Protected Route Component
 *
 * Higher-Order Component (HOC) to protect routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role
    if (requiredRole && user) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!allowedRoles.includes(user.role)) {
        // Redirect to unauthorized or dashboard
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, router, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-myunila border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
