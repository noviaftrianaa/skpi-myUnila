/**
 * withAuth HOC
 *
 * Higher Order Component for protecting routes
 * Redirects to login if user is not authenticated
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export interface WithAuthOptions {
  redirectTo?: string;
  requireRole?: string | string[];
}

/**
 * HOC to protect routes requiring authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/login', requireRole } = options;

  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Wait for auth state to load
      if (isLoading) return;

      // Redirect if not authenticated
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;

        console.log('❌ Not authenticated - redirecting to login');
        router.push(redirectUrl);
        return;
      }

      // Check role requirement
      if (requireRole && user) {
        const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
        const hasRequiredRole = allowedRoles.includes(user.role);

        if (!hasRequiredRole) {
          console.log('❌ Insufficient permissions - user role:', user.role);
          router.push('/unauthorized');
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show nothing while redirecting
    if (!isAuthenticated) {
      return null;
    }

    // Check role and show nothing while redirecting
    if (requireRole && user) {
      const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
      const hasRequiredRole = allowedRoles.includes(user.role);

      if (!hasRequiredRole) {
        return null;
      }
    }

    // Render protected component
    return <Component {...props} />;
  };
}

/**
 * Hook to check authentication (alternative to HOC)
 */
export function useRequireAuth(options: WithAuthOptions = {}) {
  const { redirectTo = '/login', requireRole } = options;
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;

      console.log('❌ Not authenticated - redirecting to login');
      router.push(redirectUrl);
      return;
    }

    if (requireRole && user) {
      const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
      const hasRequiredRole = allowedRoles.includes(user.role);

      if (!hasRequiredRole) {
        console.log('❌ Insufficient permissions - user role:', user.role);
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requireRole]);

  return { isAuthenticated, isLoading, user };
}
