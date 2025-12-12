/**
 * Kategori Aplikasi Service
 * Service untuk mengambil data kategori aplikasi dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface KategoriAplikasi {
  id_kategori: string;
  nm_kategori: string;
  icon_kategori: string | null;
  icon_color: string | null;
  urutan: number;
  a_aktif: boolean;
  tgl_create: string | null;
  last_update: string | null;
}

export interface KategoriAplikasiListItem extends KategoriAplikasi {
  jumlah_aplikasi: number;
}

export interface AplikasiInKategori {
  id_aplikasi: string;
  nm_aplikasi: string;
  icon_name: string | null;
  icon_color: string | null;
  urutan: number;
  a_tampil_portal: boolean;
  a_maintenance: boolean;
  a_coming_soon: boolean;
}

export interface KategoriAplikasiDetail extends KategoriAplikasi {
  aplikasi: AplikasiInKategori[];
}

export interface KategoriAplikasiListResult {
  data: KategoriAplikasiListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface KategoriAplikasiStats {
  total_kategori: number;
  total_aktif: number;
  total_nonaktif: number;
}

export interface KategoriAplikasiListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateKategoriAplikasiRequest {
  nm_kategori: string;
  icon_kategori?: string | null;
  icon_color?: string | null;
  urutan?: number;
  a_aktif?: boolean;
}

export interface UpdateKategoriAplikasiRequest extends CreateKategoriAplikasiRequest {}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Kategori Aplikasi Service for ManAkses
 * Manages application category data from auth-service
 */
export const kategoriAplikasiService = {
  /**
   * Get all categories (for dropdown)
   * Protected endpoint - requires JWT authentication
   */
  async getAll(): Promise<KategoriAplikasi[]> {
    const response = await authClient.get<ApiResponse<KategoriAplikasi[]>>(
      '/manakses/kategori-aplikasi/all'
    );
    return response.data.data;
  },

  /**
   * Get paginated list of categories with optional search
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: KategoriAplikasiListParams): Promise<KategoriAplikasiListResult> {
    const response = await authClient.get<ApiResponse<KategoriAplikasiListResult>>(
      '/manakses/kategori-aplikasi',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get category statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<KategoriAplikasiStats> {
    const response = await authClient.get<ApiResponse<KategoriAplikasiStats>>(
      '/manakses/kategori-aplikasi/stats'
    );
    return response.data.data;
  },

  /**
   * Get category detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<KategoriAplikasiDetail> {
    const response = await authClient.get<ApiResponse<KategoriAplikasiDetail>>(
      `/manakses/kategori-aplikasi/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new category
   * Protected endpoint - requires JWT authentication
   */
  async create(data: CreateKategoriAplikasiRequest): Promise<KategoriAplikasiDetail> {
    const response = await authClient.post<ApiResponse<KategoriAplikasiDetail>>(
      '/manakses/kategori-aplikasi',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing category
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: UpdateKategoriAplikasiRequest): Promise<KategoriAplikasiDetail> {
    const response = await authClient.put<ApiResponse<KategoriAplikasiDetail>>(
      `/manakses/kategori-aplikasi/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete category
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/kategori-aplikasi/${id}`);
  },
};

export default kategoriAplikasiService;
