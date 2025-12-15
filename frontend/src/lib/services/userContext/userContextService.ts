/**
 * User Context Service
 * Service untuk mengelola context user (role dan unit yang aktif)
 *
 * Endpoints:
 * - GET /user-context/ - Get user's available roles
 * - POST /user-context/select - Select active context
 * - GET /user-context/active - Get cached active context
 * - GET /user-context/check-access - Check app access
 * - DELETE /user-context/clear - Clear context
 * - GET /user-context/portal-apps - Get portal apps filtered by org
 * - GET /user-context/portal-categories - Get all categories
 */

import { apiClient } from '@/lib/api/client';

// Types
export interface UserRole {
  id_role_pengguna: string;
  id_peran: number;
  nm_peran: string;
  id_organisasi: string;
  nm_organisasi: string;
  level_organisasi: number;
  id_induk_organisasi: string | null;
  approval_peran: boolean;
  sk_penugasan: string | null;
  tgl_sk_penugasan: string | null;
  tgl_kadarluasa: string | null;
  last_active: string | null;
}

export interface ActiveContext {
  id_role_pengguna: string;
  id_peran: number;
  nm_peran: string;
  id_organisasi: string;
  nm_organisasi: string;
  level_organisasi: number;
  selected_at: string;
}

export interface UserContextData {
  user: {
    id_pengguna: string;
    username: string;
    nm_pengguna: string;
    email: string;
  };
  roles: UserRole[];
  active_context: ActiveContext | null;
}

export interface PortalApp {
  id_aplikasi: string;
  nm_aplikasi: string;
  ket_aplikasi: string | null;
  url: string | null;
  icon_name: string | null;
  icon_color: string | null;
  app_slug: string | null;
  urutan: number;
  id_organisasi: string;
  nm_organisasi: string;
  a_maintenance: boolean;
  a_coming_soon: boolean;
  a_terintegrasi: boolean;
}

export interface PortalCategory {
  id_kategori: string;
  nm_kategori: string;
  icon_kategori: string | null;
  icon_color: string | null;
  urutan: number;
  apps?: PortalApp[];
}

export interface PortalAppsData {
  context: ActiveContext | null;
  categories: PortalCategory[];
  total_apps: number;
}

export interface CheckAccessResult {
  has_access: boolean;
  requires_context_selection: boolean;
  context: ActiveContext | null;
  app: {
    id_aplikasi: string;
    nm_aplikasi: string;
    app_key: string;
  } | null;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * User Context Service
 * Manages user role/unit context for app access
 */
export const userContextService = {
  /**
   * Get user context - all available roles and units
   */
  async getUserContext(): Promise<UserContextData> {
    const response = await apiClient.get<ApiResponse<UserContextData>>('/user-context');
    return response.data.data;
  },

  /**
   * Select/switch active context (role + unit)
   * @param idRolePengguna - ID of the role_pengguna to select
   */
  async selectContext(idRolePengguna: string): Promise<{ active_context: ActiveContext }> {
    const response = await apiClient.post<ApiResponse<{ active_context: ActiveContext }>>(
      '/user-context/select',
      { id_role_pengguna: idRolePengguna }
    );
    return response.data.data;
  },

  /**
   * Get active context from cache
   */
  async getActiveContext(): Promise<{ active_context: ActiveContext | null; has_context: boolean }> {
    const response = await apiClient.get<ApiResponse<{ active_context: ActiveContext | null; has_context: boolean }>>(
      '/user-context/active'
    );
    return response.data.data;
  },

  /**
   * Check if user has access to specific app
   * @param appId - Application UUID
   * @param appKey - Application key (alternative to appId)
   */
  async checkAppAccess(appId?: string, appKey?: string): Promise<CheckAccessResult> {
    const params: Record<string, string> = {};
    if (appId) params.app_id = appId;
    if (appKey) params.app_key = appKey;

    const response = await apiClient.get<ApiResponse<CheckAccessResult>>(
      '/user-context/check-access',
      { params }
    );
    return response.data.data;
  },

  /**
   * Clear user context (logout scenario)
   */
  async clearContext(): Promise<void> {
    await apiClient.delete('/user-context/clear');
  },

  /**
   * Get portal apps filtered by user's active context organization
   */
  async getPortalApps(): Promise<PortalAppsData> {
    const response = await apiClient.get<ApiResponse<PortalAppsData>>('/user-context/portal-apps');
    return response.data.data;
  },

  /**
   * Get all portal categories
   */
  async getPortalCategories(): Promise<{ categories: PortalCategory[] }> {
    const response = await apiClient.get<ApiResponse<{ categories: PortalCategory[] }>>(
      '/user-context/portal-categories'
    );
    return response.data.data;
  },
};

export default userContextService;
