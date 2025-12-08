/**
 * Peran (Role) Service
 * Service untuk mengambil data peran dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface Peran {
  id_peran: number;
  nm_peran: string;
  a_perlu_sk: boolean;
  jumlah_pengguna: number;
  tgl_create: string | null;
  last_update: string | null;
}

export interface PeranDetail extends Peran {
  pengguna_list?: {
    id_pengguna: string;
    nm_pengguna: string;
    username: string;
  }[];
}

export interface PeranListResult {
  data: Peran[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PeranStats {
  total_peran: number;
  total_dengan_sk: number;
  total_tanpa_sk: number;
  total_pengguna_assigned: number;
}

export interface PeranListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PeranCreateData {
  nm_peran: string;
  a_perlu_sk?: boolean;
}

export interface PeranUpdateData extends PeranCreateData {}

// Dropdown option type
export interface PeranOption {
  id_peran: number;
  nm_peran: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Peran Service for ManAkses
 * Manages role data from auth-service
 */
export const peranService = {
  /**
   * Get paginated list of peran with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: PeranListParams): Promise<PeranListResult> {
    const response = await authClient.get<ApiResponse<PeranListResult>>(
      '/manakses/peran',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get all peran for dropdown
   * Protected endpoint - requires JWT authentication
   */
  async getAll(): Promise<PeranOption[]> {
    const response = await authClient.get<ApiResponse<PeranOption[]>>(
      '/manakses/peran/all'
    );
    return response.data.data;
  },

  /**
   * Get peran statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<PeranStats> {
    const response = await authClient.get<ApiResponse<PeranStats>>(
      '/manakses/peran/stats'
    );
    return response.data.data;
  },

  /**
   * Get peran detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: number): Promise<PeranDetail> {
    const response = await authClient.get<ApiResponse<PeranDetail>>(
      `/manakses/peran/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new peran
   * Protected endpoint - requires JWT authentication
   */
  async create(data: PeranCreateData): Promise<Peran> {
    const response = await authClient.post<ApiResponse<Peran>>(
      '/manakses/peran',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing peran
   * Protected endpoint - requires JWT authentication
   */
  async update(id: number, data: PeranUpdateData): Promise<Peran> {
    const response = await authClient.put<ApiResponse<Peran>>(
      `/manakses/peran/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete peran (soft delete)
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: number): Promise<void> {
    await authClient.delete(`/manakses/peran/${id}`);
  },
};

export default peranService;
