/**
 * Auth Hooks
 *
 * Custom React hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { ROUTES } from '@/lib/constants/routes';
import type { LoginRequest } from '@/lib/types';

/**
 * Hook to get current auth state
 * Returns user info and auth status from localStorage
 */
export function useAuth() {
  return {
    user: authService.getStoredUser(),
    isAuthenticated: authService.isAuthenticated(),
    isMahasiswa: authService.isMahasiswa(),
    isDosen: authService.isDosen(),
    isTendik: authService.isTendik(),
    isGuest: authService.isGuest(),
    role: authService.getUserRole(),
  };
}

/**
 * Hook for login mutation
 * Automatically redirects to dashboard on success
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
}

/**
 * Hook for logout mutation
 * Clears all cached data and redirects to login
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Force clear tokens even on error
      queryClient.clear();
    },
  });
}

/**
 * Hook to fetch current user from API
 * Only runs if user is authenticated
 * Cached for 5 minutes
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to validate session
 * Useful for protected routes
 */
export function useValidateSession(verifyWithBackend = false) {
  return useQuery({
    queryKey: ['auth', 'validate', verifyWithBackend],
    queryFn: () => authService.validateSession(verifyWithBackend),
    staleTime: 60 * 1000, // 1 minute
    retry: false,
  });
}
