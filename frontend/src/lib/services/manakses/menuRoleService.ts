/**
 * Menu Role Service
 * Service untuk mengelola RBAC (Role Based Access Control) menu-role dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface MenuRoleAssignment {
  id_menu: string;
  id_peran: number;
  nm_menu: string;
  nm_peran: string;
  id_aplikasi: string;
  nm_aplikasi: string;
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

export interface MenuRoleByMenu {
  menu: {
    id_menu: string;
    nm_menu: string;
    id_aplikasi: string;
    nm_aplikasi: string;
  };
  roles: {
    id_peran: number;
    nm_peran: string;
    ket_peran: string | null;
    akses_menu: string;
    a_boleh_show: boolean;
    a_boleh_insert: boolean;
    a_boleh_update: boolean;
    a_boleh_delete: boolean;
    a_boleh_sanggah: boolean;
    approval_menu: boolean;
    tgl_create: string | null;
    last_update: string | null;
  }[];
  total: number;
}

export interface MenuRoleByRole {
  id_peran: number;
  id_aplikasi: string | null;
  menus: {
    id_menu: string;
    nm_menu: string;
    nm_file: string | null;
    icon: string | null;
    level_menu: number | null;
    id_aplikasi: string;
    nm_aplikasi: string;
    akses_menu: string;
    a_boleh_show: boolean;
    a_boleh_insert: boolean;
    a_boleh_update: boolean;
    a_boleh_delete: boolean;
    a_boleh_sanggah: boolean;
    approval_menu: boolean;
    tgl_create: string | null;
    last_update: string | null;
  }[];
  total: number;
}

export interface MenuRoleDetail extends MenuRoleAssignment {
  soft_delete: boolean;
  id_updater: string;
}

export interface MenuRoleStats {
  total_assignments: number;
  total_menus_with_roles: number;
  total_roles_with_menus: number;
  total_aplikasi_with_rbac: number;
}

export interface MenuRoleListResult {
  data: MenuRoleAssignment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MenuRoleListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_aplikasi?: string;
  id_peran?: number;
  id_menu?: string;
  sort_by?: 'nm_menu' | 'nm_peran' | 'nm_aplikasi' | 'akses_menu' | 'tgl_create' | 'last_update';
  sort_order?: 'asc' | 'desc';
}

export interface MenuRolePermissions {
  akses_menu?: string;
  a_boleh_show?: boolean;
  a_boleh_insert?: boolean;
  a_boleh_update?: boolean;
  a_boleh_delete?: boolean;
  a_boleh_sanggah?: boolean;
  approval_menu?: boolean;
}

export interface CreateMenuRoleRequest extends MenuRolePermissions {
  id_menu: string;
  id_peran: number;
}

export interface UpdateMenuRoleRequest extends MenuRolePermissions {}

export interface BulkAssignRolesRequest {
  id_menu: string;
  role_ids: number[];
  permissions?: MenuRolePermissions;
}

export interface BulkAssignMenusRequest {
  id_peran: number;
  menu_ids: string[];
  permissions?: MenuRolePermissions;
}

export interface BulkAssignResult {
  id_menu?: string;
  id_peran?: number;
  assigned_count: number;
  message: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API response with pagination (backend returns strings for some fields)
interface ApiPaginatedResponse {
  success: boolean;
  message: string;
  data: unknown[];
  pagination: {
    total: string | number;
    page: string | number;
    limit: string | number;
    total_pages: string | number;
  };
}

/**
 * Helper to convert string booleans to real booleans
 * Backend returns "1"/"0" or "true"/"false" for boolean fields
 */
const parseBooleanFields = (item: Record<string, unknown>): MenuRoleAssignment => {
  return {
    ...item,
    a_boleh_show: item.a_boleh_show === true || item.a_boleh_show === "1" || item.a_boleh_show === 1 || item.a_boleh_show === "true",
    a_boleh_insert: item.a_boleh_insert === true || item.a_boleh_insert === "1" || item.a_boleh_insert === 1 || item.a_boleh_insert === "true",
    a_boleh_update: item.a_boleh_update === true || item.a_boleh_update === "1" || item.a_boleh_update === 1 || item.a_boleh_update === "true",
    a_boleh_delete: item.a_boleh_delete === true || item.a_boleh_delete === "1" || item.a_boleh_delete === 1 || item.a_boleh_delete === "true",
    a_boleh_sanggah: item.a_boleh_sanggah === true || item.a_boleh_sanggah === "1" || item.a_boleh_sanggah === 1 || item.a_boleh_sanggah === "true",
    approval_menu: item.approval_menu === true || item.approval_menu === "1" || item.approval_menu === 1 || item.approval_menu === "true",
  } as MenuRoleAssignment;
};

/**
 * Menu Role Service for ManAkses
 * Manages RBAC (menu-role assignments) from auth-service
 */
export const menuRoleService = {
  /**
   * Get paginated list of menu-role assignments
   */
  async getList(params?: MenuRoleListParams): Promise<MenuRoleListResult> {
    const response = await authClient.get<ApiPaginatedResponse>(
      '/manakses/menu-role',
      { params }
    );

    // Parse boolean fields and pagination
    const data = (response.data.data || []).map((item) =>
      parseBooleanFields(item as Record<string, unknown>)
    );
    const pagination = response.data.pagination;

    return {
      data,
      total: parseInt(String(pagination?.total || 0)),
      page: parseInt(String(pagination?.page || 1)),
      limit: parseInt(String(pagination?.limit || 10)),
      total_pages: parseInt(String(pagination?.total_pages || 1)),
    };
  },

  /**
   * Get RBAC statistics
   */
  async getStats(): Promise<MenuRoleStats> {
    const response = await authClient.get<ApiResponse<Record<string, string | number>>>(
      '/manakses/menu-role/stats'
    );
    const data = response.data.data;
    // Parse numeric strings
    return {
      total_assignments: parseInt(String(data.total_assignments || 0)),
      total_menus_with_roles: parseInt(String(data.total_menus_with_roles || 0)),
      total_roles_with_menus: parseInt(String(data.total_roles_with_menus || 0)),
      total_aplikasi_with_rbac: parseInt(String(data.total_aplikasi_with_rbac || 0)),
    };
  },

  /**
   * Get roles assigned to a specific menu
   */
  async getByMenu(idMenu: string): Promise<MenuRoleByMenu> {
    const response = await authClient.get<ApiResponse<MenuRoleByMenu>>(
      `/manakses/menu-role/by-menu/${idMenu}`
    );
    return response.data.data;
  },

  /**
   * Get menus assigned to a specific role
   * @param idPeran - Role ID
   * @param idAplikasi - Optional filter by aplikasi
   */
  async getByRole(idPeran: number, idAplikasi?: string): Promise<MenuRoleByRole> {
    const params = idAplikasi ? { id_aplikasi: idAplikasi } : {};
    const response = await authClient.get<ApiResponse<MenuRoleByRole>>(
      `/manakses/menu-role/by-role/${idPeran}`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single menu-role assignment detail
   */
  async getOne(idMenu: string, idPeran: number): Promise<MenuRoleDetail> {
    const response = await authClient.get<ApiResponse<MenuRoleDetail>>(
      `/manakses/menu-role/${idMenu}/${idPeran}`
    );
    return response.data.data;
  },

  /**
   * Create new menu-role assignment
   */
  async create(data: CreateMenuRoleRequest): Promise<{ id_menu: string; id_peran: number; message: string }> {
    const response = await authClient.post<ApiResponse<{ id_menu: string; id_peran: number; message: string }>>(
      '/manakses/menu-role',
      data
    );
    return response.data.data;
  },

  /**
   * Update menu-role assignment permissions
   */
  async update(
    idMenu: string,
    idPeran: number,
    data: UpdateMenuRoleRequest
  ): Promise<{ id_menu: string; id_peran: number; message: string }> {
    const response = await authClient.put<ApiResponse<{ id_menu: string; id_peran: number; message: string }>>(
      `/manakses/menu-role/${idMenu}/${idPeran}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete menu-role assignment (soft delete)
   */
  async delete(idMenu: string, idPeran: number): Promise<void> {
    await authClient.delete(`/manakses/menu-role/${idMenu}/${idPeran}`);
  },

  /**
   * Bulk assign multiple roles to a single menu
   */
  async bulkAssignRoles(data: BulkAssignRolesRequest): Promise<BulkAssignResult> {
    const response = await authClient.post<ApiResponse<BulkAssignResult>>(
      '/manakses/menu-role/bulk-assign-roles',
      data
    );
    return response.data.data;
  },

  /**
   * Bulk assign multiple menus to a single role
   */
  async bulkAssignMenus(data: BulkAssignMenusRequest): Promise<BulkAssignResult> {
    const response = await authClient.post<ApiResponse<BulkAssignResult>>(
      '/manakses/menu-role/bulk-assign-menus',
      data
    );
    return response.data.data;
  },
};

export default menuRoleService;
