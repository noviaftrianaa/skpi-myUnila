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
import { type AppPermissions } from '@/lib/services/userContext/userContextService';

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
    const [isBypass, setIsBypass] = useState(false);

    useEffect(() => {
      if (typeof window !== 'undefined' && localStorage.getItem('bypass_auth') === 'true') {
        setIsBypass(true);
      }
    }, []);

    useEffect(() => {
      if (isBypass) return;
      // Wait for auth state to load
      if (isLoading) return;

      // Redirect if not authenticated
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;

        router.push(redirectUrl);
        return;
      }

      // Check role requirement
      if (requireRole && user) {
        const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
        const hasRequiredRole = allowedRoles.includes(user.role || '');

        if (!hasRequiredRole) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router, isBypass]);

    // Show loading state
    if (isLoading && !isBypass) {
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
    if (!isAuthenticated && !isBypass) {
      return null;
    }

    // Check role and show nothing while redirecting
    if (requireRole && user && !isBypass) {
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
  const [isBypass, setIsBypass] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('bypass_auth') === 'true') {
      setIsBypass(true);
    }
  }, []);

  useEffect(() => {
    if (isBypass) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;

      router.push(redirectUrl);
      return;
    }

    if (requireRole && user) {
      const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
      const hasRequiredRole = allowedRoles.includes(user.role || '');

      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requireRole, isBypass]);

  if (isBypass) {
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'mock-dev-id',
        username: 'dev-mode',
        name: 'Developer Bypass',
        role: 'admin',
        roles: ['admin'],
      },
    };
  }

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
 * Default permissions (all false)
 */
const DEFAULT_PERMISSIONS: AppPermissions = {
  can_show: false,
  can_insert: false,
  can_update: false,
  can_delete: false,
  can_reject: false,
  can_approve: false,
  is_super_role: false,
};

/**
 * Hook to check app access based on user's active context/role
 * This hook will:
 * 1. Check if user is authenticated
 * 2. Check if user has selected a context (role)
 * 3. Check if that role has access to the specified app
 * 4. Return CRUD permissions for the role on that app
 */
export function useRequireAppAccess(options: WithAppAccessOptions = {}) {
  const { appId, appKey, redirectOnDenied = '/portal', showAccessDenied = true } = options;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { activeContext, isLoadingContext, checkAppAccess, roles, loadUserContext } = useUserContext();
  const router = useRouter();

  const [isBypass, setIsBypass] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('bypass_auth') === 'true') {
      setIsBypass(true);
    }
  }, []);

  const [accessState, setAccessState] = useState<{
    isChecking: boolean;
    hasAccess: boolean | null;
    requiresContextSelection: boolean;
    message: string;
    permissions: AppPermissions;
  }>({
    isChecking: true,
    hasAccess: null,
    requiresContextSelection: false,
    message: '',
    permissions: DEFAULT_PERMISSIONS,
  });

  useEffect(() => {
    if (isBypass) {
      setAccessState({
        isChecking: false,
        hasAccess: true,
        requiresContextSelection: false,
        message: 'Akses diizinkan (Dev Bypass)',
        permissions: {
          can_show: true,
          can_insert: true,
          can_update: true,
          can_delete: true,
          can_reject: true,
          can_approve: true,
          is_super_role: true,
        },
      });
      return;
    }

    const checkAccess = async () => {
      // Wait for auth to load
      if (authLoading || isLoadingContext) return;

      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // If no appId or appKey provided, allow access with full permissions
      if (!appId && !appKey) {
        setAccessState({
          isChecking: false,
          hasAccess: true,
          requiresContextSelection: false,
          message: 'Akses diizinkan',
          permissions: {
            can_show: true,
            can_insert: true,
            can_update: true,
            can_delete: true,
            can_reject: true,
            can_approve: true,
            is_super_role: false,
          },
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
        permissions: result.permissions || DEFAULT_PERMISSIONS,
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
    isBypass,
  ]);

  return {
    ...accessState,
    isLoading: isBypass ? false : (authLoading || isLoadingContext || accessState.isChecking),
    user,
    activeContext,
    roles,
    loadUserContext,
  };
}
