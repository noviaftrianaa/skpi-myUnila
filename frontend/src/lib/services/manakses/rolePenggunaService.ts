/**
 * Role Pengguna Service
 * Service untuk mengambil data role pengguna (user-role assignments) dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface RolePengguna {
  id_role_pengguna: string;
  id_pengguna: string;
  nm_pengguna: string;
  username: string;
  id_peran: number;
  nm_peran: string;
  id_organisasi: string | null;
  nm_organisasi: string | null;
  sk_penugasan: string | null;
  tgl_sk_penugasan: string | null;
  approval_peran: boolean;
  last_active: string | null;
  tgl_create: string | null;
  last_update: string | null;
}

export interface RolePenggunaDetail extends RolePengguna {}

export interface RolePenggunaListResult {
  data: RolePengguna[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface RolePenggunaListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_pengguna?: string;
  id_peran?: number;
  id_organisasi?: string;
  sort_by?: 'nm_pengguna' | 'username' | 'nm_peran' | 'nm_organisasi' | 'sk_penugasan' | 'tgl_sk_penugasan' | 'last_active' | 'tgl_create' | 'last_update';
  sort_order?: 'asc' | 'desc';
}

export interface RolePenggunaCreateData {
  id_pengguna: string;
  id_peran: number;
  id_organisasi?: string | null;
  sk_penugasan?: string | null;
  tgl_sk_penugasan?: string | null;
  approval_peran?: boolean;
}

export interface RolePenggunaUpdateData {
  id_peran: number;
  id_organisasi?: string | null;
  sk_penugasan?: string | null;
  tgl_sk_penugasan?: string | null;
  approval_peran?: boolean;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Role Pengguna Service for ManAkses
 * Manages user-role assignment data from auth-service
 */
export const rolePenggunaService = {
  /**
   * Get paginated list of role pengguna with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: RolePenggunaListParams): Promise<RolePenggunaListResult> {
    const response = await authClient.get<ApiResponse<RolePenggunaListResult>>(
      '/manakses/role-pengguna',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get roles by pengguna ID
   * Protected endpoint - requires JWT authentication
   */
  async getByPengguna(idPengguna: string): Promise<RolePengguna[]> {
    const response = await authClient.get<ApiResponse<RolePengguna[]>>(
      `/manakses/role-pengguna/by-pengguna/${idPengguna}`
    );
    return response.data.data;
  },

  /**
   * Get role pengguna detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<RolePenggunaDetail> {
    const response = await authClient.get<ApiResponse<RolePenggunaDetail>>(
      `/manakses/role-pengguna/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new role pengguna
   * Protected endpoint - requires JWT authentication
   */
  async create(data: RolePenggunaCreateData): Promise<RolePengguna> {
    const response = await authClient.post<ApiResponse<RolePengguna>>(
      '/manakses/role-pengguna',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing role pengguna
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: RolePenggunaUpdateData): Promise<RolePengguna> {
    const response = await authClient.put<ApiResponse<RolePengguna>>(
      `/manakses/role-pengguna/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete role pengguna (soft delete)
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/role-pengguna/${id}`);
  },
};

export default rolePenggunaService;
