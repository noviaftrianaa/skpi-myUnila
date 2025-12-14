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
  mfa_enabled: boolean;
  has_sso: boolean;
  sumber_data: 'SSO Radius' | 'Manajemen Akses';
  tgl_create: string | null;
  last_update: string | null;
  last_login_at: string | null;
  active_role: string | null;
  active_organisasi: string | null;
  active_jenjang: string | null;
  active_display_organisasi: string | null;
}

export interface PenggunaDetail extends Pengguna {
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  alamat: string | null;
  no_tel: string | null;
  approval_pengguna: boolean;
  tgl_ganti_pwd: string | null;
  last_login_ip: string | null;
  roles: PenggunaRole[];
}

export interface PenggunaRole {
  id_role_pengguna: string;
  id_peran: string;
  nm_peran: string;
  id_organisasi: string | null;
  nm_organisasi: string | null;
  id_jns_lemb: number | null;
  nm_jns_lemb: string | null;
  jenjang: string | null;
  display_organisasi: string | null;
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
  total_peran: number;
  role_mahasiswa: number;
  role_dosen: number;
  role_tendik: number;
  role_lainnya: number;
}

export interface PenggunaListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
  has_sso?: 'yes' | 'no';
  id_peran?: string;
  sort_by?: 'username' | 'nm_pengguna' | 'email' | 'tgl_create' | 'last_update' | 'last_login_at';
  sort_order?: 'asc' | 'desc';
}

export interface PeranOption {
  id_peran: string;
  nm_peran: string;
  jumlah_pengguna: number;
}

export interface RadiusStatus {
  api_enabled: boolean;
  api_configured: boolean;
  api_available: boolean;
  fallback_available: boolean;
  source: 'api' | 'database' | 'none';
}

export interface SsoUser {
  username: string;
  nama: string | null;
  email: string | null;
  [key: string]: unknown;
}

export interface SsoUsersResult {
  data: SsoUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SsoUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PenggunaUpdateData {
  nm_pengguna?: string;
  email?: string;
  jenis_kelamin?: 'L' | 'P';
  tempat_lahir?: string;
  tgl_lahir?: string;
  alamat?: string;
  no_tel?: string;
  no_hp?: string;
  jabatan?: string;
  a_aktif?: boolean;
  disable?: boolean;
}

export interface MfaResetResult {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  mfa_was_enabled: boolean;
  message: string;
}

export interface PasswordResetResult {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  message: string;
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

  /**
   * Get Radius API status
   * Protected endpoint - requires JWT authentication
   */
  async getRadiusStatus(): Promise<RadiusStatus> {
    const response = await authClient.get<ApiResponse<RadiusStatus>>(
      '/manakses/pengguna/radius-status'
    );
    return response.data.data;
  },

  /**
   * Get SSO users from Radius API
   * Protected endpoint - requires JWT authentication
   */
  async getSsoUsers(params?: SsoUsersParams): Promise<SsoUsersResult> {
    const response = await authClient.get<ApiResponse<SsoUsersResult>>(
      '/manakses/pengguna/sso-users',
      { params }
    );
    return response.data.data;
  },

  /**
   * Clear Radius API cache
   * Protected endpoint - requires JWT authentication
   */
  async clearRadiusCache(): Promise<void> {
    await authClient.post('/manakses/pengguna/clear-radius-cache');
  },

  /**
   * Update pengguna
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: PenggunaUpdateData): Promise<PenggunaDetail> {
    const response = await authClient.put<ApiResponse<PenggunaDetail>>(
      `/manakses/pengguna/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete pengguna (soft delete)
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/pengguna/${id}`);
  },

  /**
   * Get distinct peran options from role_pengguna
   * Protected endpoint - requires JWT authentication
   */
  async getPeranOptions(): Promise<PeranOption[]> {
    const response = await authClient.get<ApiResponse<PeranOption[]>>(
      '/manakses/pengguna/peran-options'
    );
    return response.data.data;
  },

  /**
   * Reset MFA for a pengguna
   * Protected endpoint - requires JWT authentication
   */
  async resetMfa(id: string): Promise<MfaResetResult> {
    const response = await authClient.post<ApiResponse<MfaResetResult>>(
      `/manakses/pengguna/${id}/reset-mfa`
    );
    return response.data.data;
  },

  /**
   * Reset password for a pengguna to default "unilajaya"
   * Protected endpoint - requires JWT authentication
   */
  async resetPassword(id: string): Promise<PasswordResetResult> {
    const response = await authClient.post<ApiResponse<PasswordResetResult>>(
      `/manakses/pengguna/${id}/reset-password`
    );
    return response.data.data;
  },
};

export default penggunaService;
