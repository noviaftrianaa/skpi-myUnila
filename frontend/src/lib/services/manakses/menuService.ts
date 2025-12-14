/**
 * Menu Service
 * Service untuk mengelola menu aplikasi dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface Menu {
  id_menu: string;
  nm_menu: string;
  nm_file: string | null;
  urutan_menu: number;
  a_aktif: boolean;
  a_tampil: boolean;
  icon: string | null;
  level_menu: number | null;
  id_aplikasi: string;
  id_group_menu: string | null;
  tgl_create: string | null;
  last_update: string | null;
  expired_date: string | null;
  children?: Menu[];
}

export interface MenuRole {
  id_peran: string;
  nm_peran: string;
  akses_menu: string;
  a_boleh_show: boolean;
  a_boleh_insert: boolean;
  a_boleh_update: boolean;
  a_boleh_delete: boolean;
  a_boleh_sanggah: boolean;
  approval_menu: boolean;
  tgl_create: string | null;
  last_update: string | null;
}

export interface MenuStats {
  total_menus: number;
  total_aktif: number;
  total_nonaktif: number;
  total_parent: number;
  total_child: number;
  total_aplikasi: number;
}

export interface MenusByAplikasiResult {
  menus: Menu[];
  total: number;
  format: 'tree' | 'flat';
}

export interface MenuDetail {
  id_menu: string;
  nm_menu: string;
  nm_file: string | null;
  urutan_menu: number;
  a_aktif: boolean;
  a_tampil: boolean;
  icon: string | null;
  level_menu: number | null;
  id_aplikasi: string;
  nm_aplikasi: string;
  id_group_menu: string | null;
  nm_group_menu: string | null;
  tgl_create: string | null;
  last_update: string | null;
  expired_date: string | null;
}

export interface MenuRolesResult {
  menu: {
    id_menu: string;
    nm_menu: string;
  };
  roles: MenuRole[];
  total: number;
}

export interface CreateMenuRequest {
  id_aplikasi: string;
  nm_menu: string;
  nm_file?: string | null;
  urutan_menu?: number;
  a_aktif?: boolean;
  a_tampil?: boolean;
  icon?: string | null;
  level_menu?: number | null;
  id_group_menu?: string | null;
}

export interface UpdateMenuRequest {
  nm_menu?: string;
  nm_file?: string | null;
  urutan_menu?: number;
  a_aktif?: boolean;
  a_tampil?: boolean;
  icon?: string | null;
  level_menu?: number | null;
  id_group_menu?: string | null;
}

export interface SyncMenusRequest {
  menus: {
    nm_menu: string;
    nm_file?: string | null;
    icon?: string | null;
    urutan_menu?: number;
    level_menu?: number | null;
    a_aktif?: boolean;
    a_tampil?: boolean;
    children?: SyncMenusRequest['menus'];
  }[];
}

export interface SyncMenusResult {
  created: number;
  updated: number;
  total: number;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MenuListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_aplikasi?: string;
  a_aktif?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface MenuListResult {
  data: Menu[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Menu Service for ManAkses
 * Manages menu data from auth-service
 */
export const menuService = {
  /**
   * Get paginated list of all menus
   * @param params - Query parameters
   */
  async getList(params: MenuListParams = {}): Promise<MenuListResult> {
    const response = await authClient.get<MenuListResult & { success: boolean; message: string }>(
      '/manakses/menu',
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  },

  /**
   * Get menu statistics
   * @param idAplikasi - Optional filter by aplikasi
   */
  async getStats(idAplikasi?: string): Promise<MenuStats> {
    const params = idAplikasi ? { id_aplikasi: idAplikasi } : {};
    const response = await authClient.get<ApiResponse<MenuStats>>(
      '/manakses/menu/stats',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get menus by aplikasi ID
   * @param idAplikasi - Aplikasi UUID
   * @param format - 'tree' or 'flat' (default: tree)
   * @param includeRoles - Include role assignments (default: false)
   */
  async getByAplikasi(
    idAplikasi: string,
    format: 'tree' | 'flat' = 'tree',
    includeRoles: boolean = false
  ): Promise<MenusByAplikasiResult> {
    const response = await authClient.get<ApiResponse<MenusByAplikasiResult>>(
      `/manakses/menu/by-aplikasi/${idAplikasi}`,
      { params: { format, include_roles: includeRoles ? '1' : '0' } }
    );
    return response.data.data;
  },

  /**
   * Get menu detail by ID
   */
  async getDetail(id: string): Promise<MenuDetail> {
    const response = await authClient.get<ApiResponse<MenuDetail>>(
      `/manakses/menu/${id}`
    );
    return response.data.data;
  },

  /**
   * Get menu roles (which roles have access to this menu)
   */
  async getRoles(id: string): Promise<MenuRolesResult> {
    const response = await authClient.get<ApiResponse<MenuRolesResult>>(
      `/manakses/menu/${id}/roles`
    );
    return response.data.data;
  },

  /**
   * Create new menu
   */
  async create(data: CreateMenuRequest): Promise<Menu> {
    const response = await authClient.post<ApiResponse<Menu>>(
      '/manakses/menu',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing menu
   */
  async update(id: string, data: UpdateMenuRequest): Promise<Menu> {
    const response = await authClient.put<ApiResponse<Menu>>(
      `/manakses/menu/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete menu
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/menu/${id}`);
  },

  /**
   * Sync menus from frontend config
   * Bulk create/update menus for an aplikasi
   */
  async syncMenus(idAplikasi: string, data: SyncMenusRequest): Promise<SyncMenusResult> {
    const response = await authClient.post<ApiResponse<SyncMenusResult>>(
      `/manakses/menu/sync/${idAplikasi}`,
      data
    );
    return response.data.data;
  },
};

export default menuService;
