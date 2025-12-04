/**
 * Aplikasi Service
 * Service untuk mengambil data aplikasi dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface Aplikasi {
  id_aplikasi: string;
  nm_aplikasi: string;
  ket_aplikasi: string | null;
  url: string | null;
  port: number | null;
  teknologi: string | null;
  endpoint_ws: string | null;
  a_generate_menu: boolean;
  a_integrasi_cas: boolean;
  a_sistem_internal_pt: boolean;
  status: 'Aktif' | 'Tidak Aktif';
  jenis: 'Internal' | 'External';
  id_organisasi: string | null;
  nm_organisasi: string | null;
  jumlah_table: number;
  jumlah_pj: number;
  tgl_create: string | null;
  last_update: string | null;
  expired_date: string | null;
}

export interface AplikasiTable {
  id_table_app: string;
  nm_table: string;
  ket_table: string | null;
  tgl_create: string | null;
  last_update: string | null;
}

export interface AplikasiPJ {
  id_pj_aplikasi: string;
  id_pengguna: string;
  nm_pengguna: string;
  username: string;
  email: string | null;
  tgl_create: string | null;
  last_update: string | null;
}

export interface AplikasiDetail extends Aplikasi {
  id_blob: string | null;
  token_aplikasi: string | null;
  app_key: string | null;
  last_sync: string | null;
  tables: AplikasiTable[];
  pj_list: AplikasiPJ[];
}

export interface AplikasiListResult {
  data: Aplikasi[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AplikasiStats {
  total_aplikasi: number;
  total_aktif: number;
  total_nonaktif: number;
  total_internal: number;
  total_external: number;
  total_integrasi_cas: number;
}

export interface AplikasiListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
  jenis?: 'internal' | 'external';
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Aplikasi Service for ManAkses
 * Manages application data from auth-service
 */
export const aplikasiService = {
  /**
   * Get paginated list of aplikasi with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: AplikasiListParams): Promise<AplikasiListResult> {
    const response = await authClient.get<ApiResponse<AplikasiListResult>>(
      '/manakses/aplikasi',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get aplikasi statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<AplikasiStats> {
    const response = await authClient.get<ApiResponse<AplikasiStats>>(
      '/manakses/aplikasi/stats'
    );
    return response.data.data;
  },

  /**
   * Get aplikasi detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<AplikasiDetail> {
    const response = await authClient.get<ApiResponse<AplikasiDetail>>(
      `/manakses/aplikasi/${id}`
    );
    return response.data.data;
  },
};

export default aplikasiService;
