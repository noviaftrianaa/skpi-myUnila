/**
 * Pengguna Service
 * Service untuk mengambil data pengguna dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface Pengguna {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  jenis_kelamin: string | null;
  no_hp: string | null;
  jabatan: string | null;
  a_aktif: boolean;
  disable: boolean;
  status: string;
  has_sso: boolean;
  sumber_data: 'SSO Radius' | 'Manajemen Akses';
  tgl_create: string | null;
  last_update: string | null;
  last_login_at: string | null;
  active_role: string | null;
  active_organisasi: string | null;
}

export interface PenggunaDetail extends Pengguna {
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  alamat: string | null;
  no_tel: string | null;
  approval_pengguna: boolean;
  last_login_ip: string | null;
  roles: PenggunaRole[];
}

export interface PenggunaRole {
  id_role_pengguna: string;
  id_peran: string;
  nm_peran: string;
  id_organisasi: string | null;
  nm_organisasi: string | null;
  approval_peran: boolean;
  tgl_create: string | null;
  last_active: string | null;
}

export interface PenggunaListResult {
  data: Pengguna[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PenggunaStats {
  total_pengguna: number;
  total_aktif: number;
  total_nonaktif: number;
  total_sso: number;
  total_non_sso: number;
}

export interface PenggunaListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
  has_sso?: 'yes' | 'no';
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Pengguna Service for ManAkses
 * Manages user data from auth-service
 */
export const penggunaService = {
  /**
   * Get paginated list of pengguna with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: PenggunaListParams): Promise<PenggunaListResult> {
    const response = await authClient.get<ApiResponse<PenggunaListResult>>(
      '/manakses/pengguna',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get pengguna statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<PenggunaStats> {
    const response = await authClient.get<ApiResponse<PenggunaStats>>(
      '/manakses/pengguna/stats'
    );
    return response.data.data;
  },

  /**
   * Get pengguna detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<PenggunaDetail> {
    const response = await authClient.get<ApiResponse<PenggunaDetail>>(
      `/manakses/pengguna/${id}`
    );
    return response.data.data;
  },
};

export default penggunaService;
