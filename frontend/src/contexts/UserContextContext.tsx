/**
 * User Context Context
 *
 * Global user context state management (role/unit selection)
 * Separate from AuthContext to handle role-based access control
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userContextService, type UserRole, type ActiveContext, type PortalAppsData } from '@/lib/services/userContext/userContextService';
import { useAuth } from './AuthContext';

/**
 * User Context State
 */
interface UserContextState {
  // Data
  roles: UserRole[];
  activeContext: ActiveContext | null;
  portalData: PortalAppsData | null;

  // Loading states
  isLoadingContext: boolean;
  isLoadingPortal: boolean;
  isSelectingContext: boolean;

  // Error
  error: string | null;

  // Actions
  loadUserContext: () => Promise<void>;
  loadPortalApps: () => Promise<void>;
  selectContext: (idRolePengguna: string) => Promise<boolean>;
  checkAppAccess: (appId?: string, appKey?: string) => Promise<{ hasAccess: boolean; requiresSelection: boolean; message: string }>;
  clearError: () => void;
}

/**
 * User Context
 */
const UserContextContext = createContext<UserContextState | undefined>(undefined);

/**
 * User Context Provider Props
 */
interface UserContextProviderProps {
  children: ReactNode;
}

/**
 * User Context Provider Component
 */
export function UserContextProvider({ children }: UserContextProviderProps) {
  const { isAuthenticated, user } = useAuth();

  // State
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  const [portalData, setPortalData] = useState<PortalAppsData | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isSelectingContext, setIsSelectingContext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user context (roles and active context)
   */
  const loadUserContext = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingContext(true);
      setError(null);

      const data = await userContextService.getUserContext();
      setRoles(data.roles);
      setActiveContext(data.active_context);

      // If user has only one approved role, auto-select it
      const approvedRoles = data.roles.filter(r => r.approval_peran);
      if (!data.active_context && approvedRoles.length === 1) {
        await selectContext(approvedRoles[0].id_role_pengguna);
      }
    } catch (err: any) {
      // Don't set error for context loading failure - portal can still work
      console.error('Failed to load user context:', err);
      // Only set error if it's not a 404 (route not found)
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat context pengguna');
      }
    } finally {
      setIsLoadingContext(false);
    }
  }, [isAuthenticated]);

  /**
   * Load portal apps based on active context
   */
  const loadPortalApps = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingPortal(true);
      setError(null);

      const data = await userContextService.getPortalApps();
      setPortalData(data);

      // Update active context from portal apps response
      if (data.context) {
        setActiveContext(data.context);
      }
    } catch (err: any) {
      console.error('Failed to load portal apps:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat aplikasi portal');
    } finally {
      setIsLoadingPortal(false);
    }
  }, [isAuthenticated]);

  /**
   * Select/switch context (role + unit)
   */
  const selectContext = async (idRolePengguna: string): Promise<boolean> => {
    try {
      setIsSelectingContext(true);
      setError(null);

      const result = await userContextService.selectContext(idRolePengguna);
      setActiveContext(result.active_context);

      // Reload portal apps after context change
      await loadPortalApps();

      return true;
    } catch (err: any) {
      console.error('Failed to select context:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memilih peran');
      return false;
    } finally {
      setIsSelectingContext(false);
    }
  };

  /**
   * Check if user has access to specific app
   */
  const checkAppAccess = async (appId?: string, appKey?: string): Promise<{ hasAccess: boolean; requiresSelection: boolean; message: string }> => {
    try {
      const result = await userContextService.checkAppAccess(appId, appKey);
      return {
        hasAccess: result.has_access,
        requiresSelection: result.requires_context_selection || false,
        message: result.has_access ? 'Akses diizinkan' : (result.requires_context_selection ? 'Silakan pilih peran terlebih dahulu' : 'Anda tidak memiliki akses ke aplikasi ini'),
      };
    } catch (err: any) {
      console.error('Failed to check app access:', err);
      // Check if it's a "requires context selection" error
      const message = err.response?.data?.message || err.message || 'Gagal memeriksa akses';
      const requiresSelection = message.toLowerCase().includes('pilih') || message.toLowerCase().includes('belum');
      return {
        hasAccess: false,
        requiresSelection,
        message,
      };
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Initialize context when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadUserContext();
    } else {
      // Reset state when logged out
      setRoles([]);
      setActiveContext(null);
      setPortalData(null);
    }
  }, [isAuthenticated, loadUserContext]);

  const value: UserContextState = {
    roles,
    activeContext,
    portalData,
    isLoadingContext,
    isLoadingPortal,
    isSelectingContext,
    error,
    loadUserContext,
    loadPortalApps,
    selectContext,
    checkAppAccess,
    clearError,
  };

  return <UserContextContext.Provider value={value}>{children}</UserContextContext.Provider>;
}

/**
 * useUserContext Hook
 */
export function useUserContext(): UserContextState {
  const context = useContext(UserContextContext);

  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }

  return context;
}

export default UserContextContext;
