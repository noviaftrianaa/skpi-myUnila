/**
 * Unit Organisasi Service
 * Service untuk mengambil data unit organisasi dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface UnitOrganisasi {
  id_organisasi: string;
  nm_lemb: string;
  jln: string | null;
  no_tel: string | null;
  email: string | null;
  website: string | null;
  level_organisasi: number | null;
  a_aktif: boolean;
  nm_induk_organisasi: string | null;
  id_induk_organisasi: string | null;
  jumlah_child: number;
  tgl_create: string | null;
  last_update: string | null;
}

export interface UnitOrganisasiDetail extends UnitOrganisasi {
  children?: UnitOrganisasi[];
}

export interface UnitOrganisasiListResult {
  data: UnitOrganisasi[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UnitOrganisasiStats {
  total_unit: number;
  total_aktif: number;
  total_nonaktif: number;
  total_level_1: number;
  total_level_2: number;
  total_level_3: number;
}

export interface UnitOrganisasiListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface UnitOrganisasiCreateData {
  nm_lemb: string;
  jln?: string | null;
  no_tel?: string | null;
  email?: string | null;
  website?: string | null;
  level_organisasi?: number | null;
  a_aktif?: boolean;
  id_induk_organisasi?: string | null;
}

export interface UnitOrganisasiUpdateData extends UnitOrganisasiCreateData {}

// Dropdown option type
export interface UnitOrganisasiOption {
  id_organisasi: string;
  nm_lemb: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Unit Organisasi Service for ManAkses
 * Manages organization unit data from auth-service
 */
export const unitOrganisasiService = {
  /**
   * Get paginated list of unit organisasi with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: UnitOrganisasiListParams): Promise<UnitOrganisasiListResult> {
    const response = await authClient.get<ApiResponse<UnitOrganisasiListResult>>(
      '/manakses/unit-organisasi',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get all unit organisasi for dropdown
   * Protected endpoint - requires JWT authentication
   */
  async getAll(): Promise<UnitOrganisasiOption[]> {
    const response = await authClient.get<ApiResponse<UnitOrganisasiOption[]>>(
      '/manakses/unit-organisasi/all'
    );
    return response.data.data;
  },

  /**
   * Get unit organisasi statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<UnitOrganisasiStats> {
    const response = await authClient.get<ApiResponse<UnitOrganisasiStats>>(
      '/manakses/unit-organisasi/stats'
    );
    return response.data.data;
  },

  /**
   * Get unit organisasi detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<UnitOrganisasiDetail> {
    const response = await authClient.get<ApiResponse<UnitOrganisasiDetail>>(
      `/manakses/unit-organisasi/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new unit organisasi
   * Protected endpoint - requires JWT authentication
   */
  async create(data: UnitOrganisasiCreateData): Promise<UnitOrganisasi> {
    const response = await authClient.post<ApiResponse<UnitOrganisasi>>(
      '/manakses/unit-organisasi',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing unit organisasi
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: UnitOrganisasiUpdateData): Promise<UnitOrganisasi> {
    const response = await authClient.put<ApiResponse<UnitOrganisasi>>(
      `/manakses/unit-organisasi/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete unit organisasi (soft delete)
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/unit-organisasi/${id}`);
  },
};

export default unitOrganisasiService;
