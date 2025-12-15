/**
 * withAuth HOC
 *
 * Higher Order Component for protecting routes
 * Redirects to login if user is not authenticated
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserContext } from '@/contexts/UserContextContext';

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
        const hasRequiredRole = allowedRoles.includes(user.role || '');

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
      const hasRequiredRole = allowedRoles.includes(user.role || '');

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
      const hasRequiredRole = allowedRoles.includes(user.role || '');

      if (!hasRequiredRole) {
        console.log('❌ Insufficient permissions - user role:', user.role);
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requireRole]);

  return { isAuthenticated, isLoading, user };
}

/**
 * Options for app access check
 */
export interface WithAppAccessOptions {
  appId?: string;
  appKey?: string;
  redirectOnDenied?: string;
  showAccessDenied?: boolean;
}

/**
 * Hook to check app access based on user's active context/role
 * This hook will:
 * 1. Check if user is authenticated
 * 2. Check if user has selected a context (role)
 * 3. Check if that role has access to the specified app
 */
export function useRequireAppAccess(options: WithAppAccessOptions = {}) {
  const { appId, appKey, redirectOnDenied = '/portal', showAccessDenied = true } = options;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { activeContext, isLoadingContext, checkAppAccess, roles, loadUserContext } = useUserContext();
  const router = useRouter();

  const [accessState, setAccessState] = useState<{
    isChecking: boolean;
    hasAccess: boolean | null;
    requiresContextSelection: boolean;
    message: string;
  }>({
    isChecking: true,
    hasAccess: null,
    requiresContextSelection: false,
    message: '',
  });

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to load
      if (authLoading || isLoadingContext) return;

      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // If no appId or appKey provided, allow access
      if (!appId && !appKey) {
        setAccessState({
          isChecking: false,
          hasAccess: true,
          requiresContextSelection: false,
          message: 'Akses diizinkan',
        });
        return;
      }

      // Check app access
      const result = await checkAppAccess(appId, appKey);

      setAccessState({
        isChecking: false,
        hasAccess: result.hasAccess,
        requiresContextSelection: result.requiresSelection,
        message: result.message,
      });

      // Redirect if denied and showAccessDenied is false
      if (!result.hasAccess && !showAccessDenied && !result.requiresSelection) {
        router.push(redirectOnDenied);
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    authLoading,
    isLoadingContext,
    activeContext,
    appId,
    appKey,
    checkAppAccess,
    router,
    redirectOnDenied,
    showAccessDenied,
  ]);

  return {
    ...accessState,
    isLoading: authLoading || isLoadingContext || accessState.isChecking,
    user,
    activeContext,
    roles,
    loadUserContext,
  };
}
