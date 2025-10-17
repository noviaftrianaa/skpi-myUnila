/**
 * Auth Context
 *
 * Global authentication state management using React Context
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import type { User, LoginRequest } from '@/lib/types/auth.types';
import { handleApiError, ApiError } from '@/lib/api/client';

/**
 * Auth Context State
 */
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: ApiError | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (roleName: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  /**
   * Initialize auth state
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication
   * - Check if user is authenticated
   * - Load user data from storage
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if authenticated
      const isAuth = authService.isAuthenticated();

      if (isAuth) {
        // Get stored user
        const storedUser = authService.getStoredUser();

        if (storedUser) {
          setUser(storedUser);

          // Optionally verify with backend
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch (err) {
            console.warn('⚠️  Could not verify user with backend:', err);
            // Keep using stored user if backend verification fails
          }
        }
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);

      if (response.success) {
        // Check if MFA is required
        if (response.data.mfa_required) {
          // Don't set user or redirect - let login page handle MFA
          console.log('🔐 MFA required, returning to login page for verification');
          return; // Return early, login page will show MFA modal
        }

        setUser(response.data.user);

        // Check if there's a redirect URL
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect');

        // Redirect to the requested page or portal
        if (redirectUrl && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else {
          router.push('/portal');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Clear user even if API call fails
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (err) {
      console.error('❌ Refresh user error:', err);
      setError(handleApiError(err));
      throw err;
    }
  };

  /**
   * Switch user role
   */
  const switchRole = async (roleName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await authService.switchRole(roleName);
      setUser(updatedUser);

      console.log('✅ Role switched in context:', roleName);
    } catch (err) {
      console.error('❌ Switch role error:', err);
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshUser,
    switchRole,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
