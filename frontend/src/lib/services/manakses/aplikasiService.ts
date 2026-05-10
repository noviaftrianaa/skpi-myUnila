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
  id_kategori: string | null;
  nm_kategori: string | null;
  icon_name: string | null;
  icon_color: string | null;
  app_slug: string | null;
  urutan: number;
  a_tampil_portal: boolean;
  a_maintenance: boolean;
  a_coming_soon: boolean;
  a_terintegrasi: boolean;
  a_live: boolean;
  a_filter_organisasi: boolean;
  jumlah_table: number;
  jumlah_pj: number;
  jumlah_menu: number;
  tgl_create: string | null;
  last_update: string | null;
  expired_date: string | null;
}

export interface KategoriAplikasi {
  id_kategori: string;
  nm_kategori: string;
  icon_kategori: string | null;
  icon_color: string | null;
  urutan: number;
}

export interface AplikasiTable {
  id_akses_table_app: string;
  id_table_app: string;
  nm_table: string;
  tabel_alias: string | null;
  skema_tbl: string | null;
  a_boleh_get: boolean;
  a_boleh_insert: boolean;
  a_boleh_update: boolean;
  a_boleh_delete: boolean;
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

export interface AplikasiMenu {
  id_menu: string;
  nm_menu: string;
  icon_menu: string | null;
  url_menu: string | null;
  urutan: number;
  a_aktif: boolean;
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
  menus: AplikasiMenu[];
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
  total_live: number;
  total_dev: number;
  total_terintegrasi: number;
  total_portal: number;
  total_maintenance: number;
  total_aktif: number;
  total_nonaktif: number;
}

export interface AplikasiListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
  mode?: 'production' | 'development';
  portal?: 'ya' | 'tidak';
  terintegrasi?: 'ya' | 'tidak';
  sso_cas?: 'ya' | 'tidak';
  maintenance?: 'ya' | 'tidak';
  coming_soon?: 'ya' | 'tidak';
  sort_by?: 'nm_aplikasi' | 'url' | 'teknologi' | 'nm_kategori' | 'nm_organisasi' | 'tgl_create' | 'last_update' | 'urutan';
  sort_order?: 'asc' | 'desc';
}

export interface CreateAplikasiRequest {
  nm_aplikasi: string;
  ket_aplikasi?: string | null;
  id_organisasi?: string | null;
  id_kategori?: string | null;
  url?: string | null;
  port?: string | null;
  teknologi?: string | null;
  endpoint_ws?: string | null;
  icon_name?: string | null;
  icon_color?: string | null;
  app_slug?: string | null;
  urutan?: number;
  a_generate_menu?: boolean;
  a_integrasi_cas?: boolean;
  a_sistem_internal_pt?: boolean;
  a_tampil_portal?: boolean;
  a_maintenance?: boolean;
  a_coming_soon?: boolean;
  a_terintegrasi?: boolean;
  a_live?: boolean;
  a_filter_organisasi?: boolean;
  status?: 'Aktif' | 'Tidak Aktif';
}

export interface UpdateAplikasiRequest extends CreateAplikasiRequest {}

export interface AplikasiOrganisasi {
  id_app_org: string;
  id_organisasi: string;
  a_include_children: boolean;
  ket: string | null;
  nm_organisasi: string;
  tgl_create?: string | null;
  last_update?: string | null;
}

export interface AddAplikasiOrganisasiRequest {
  id_organisasi: string;
  a_include_children?: boolean;
  ket?: string | null;
}

// Default-role per aplikasi (Pilar 6 — peran identitas)
export interface AplikasiDefaultRole {
  id_peran: number;
  nm_peran: string;
  has_default: boolean;
}

// Akses pengguna per aplikasi (read-only listing)
export type AksesVia = "identitas" | "fungsional" | "universal";

export interface AksesPenggunaPeranSummary {
  id_peran: number;
  nm_peran: string;
  a_peran_identitas: boolean;
  a_universal: boolean;
  akses_via: AksesVia;
  jumlah_user: number;
}

export interface AksesPenggunaItem {
  id_role_pengguna: string;
  id_pengguna: string;
  nm_pengguna: string;
  username: string;
  email: string | null;
  id_peran: number;
  nm_peran: string;
  a_peran_identitas: boolean;
  a_universal: boolean;
  akses_via: AksesVia;
  id_organisasi: string | null;
  nm_organisasi: string | null;
  sk_penugasan: string | null;
  tgl_sk_penugasan: string | null;
  approval_peran: number | null;
  last_active: string | null;
  tgl_create: string | null;
}

export interface AksesPenggunaResult {
  app: { id_aplikasi: string; nm_aplikasi: string; app_slug: string | null };
  summary: {
    total_user: number;
    total_identitas: number;
    total_fungsional: number;
    total_universal: number;
    per_peran: AksesPenggunaPeranSummary[];
  };
  pengguna: {
    data: AksesPenggunaItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface AksesPenggunaParams {
  page?: number;
  limit?: number;
  search?: string;
  id_peran?: number;
  akses_via?: AksesVia;
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
   * Get aplikasi categories for dropdown
   * Protected endpoint - requires JWT authentication
   */
  async getCategories(): Promise<KategoriAplikasi[]> {
    const response = await authClient.get<ApiResponse<KategoriAplikasi[]>>(
      '/manakses/aplikasi/categories'
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

  /**
   * Create new aplikasi
   * Protected endpoint - requires JWT authentication
   */
  async create(data: CreateAplikasiRequest): Promise<Aplikasi> {
    const response = await authClient.post<ApiResponse<Aplikasi>>(
      '/manakses/aplikasi',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing aplikasi
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: UpdateAplikasiRequest): Promise<Aplikasi> {
    const response = await authClient.put<ApiResponse<Aplikasi>>(
      `/manakses/aplikasi/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete aplikasi
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/aplikasi/${id}`);
  },

  /**
   * Regenerate app_key for aplikasi
   * Protected endpoint - requires JWT authentication
   */
  async regenerateAppKey(id: string): Promise<{ id_aplikasi: string; app_key: string }> {
    const response = await authClient.post<ApiResponse<{ id_aplikasi: string; app_key: string }>>(
      `/manakses/aplikasi/${id}/regenerate-app-key`
    );
    return response.data.data;
  },

  async getOrganisasi(id: string): Promise<AplikasiOrganisasi[]> {
    const response = await authClient.get<ApiResponse<AplikasiOrganisasi[]>>(
      `/manakses/aplikasi/${id}/organisasi`
    );
    return response.data.data;
  },

  async addOrganisasi(id: string, data: AddAplikasiOrganisasiRequest): Promise<void> {
    await authClient.post(`/manakses/aplikasi/${id}/organisasi`, data);
  },

  async removeOrganisasi(id: string, orgId: string): Promise<void> {
    await authClient.delete(`/manakses/aplikasi/${id}/organisasi/${orgId}`);
  },

  /**
   * Default-role per aplikasi (Pilar 6).
   * Returns SEMUA peran identitas + flag has_default.
   */
  async getDefaultRoles(id: string): Promise<AplikasiDefaultRole[]> {
    const response = await authClient.get<ApiResponse<AplikasiDefaultRole[]>>(
      `/manakses/aplikasi/${id}/default-roles`
    );
    return response.data.data;
  },

  /**
   * Sync default-role per aplikasi.
   * Body: array id_peran identitas yg dicentang.
   */
  async syncDefaultRoles(id: string, roleIds: number[]): Promise<void> {
    await authClient.put(`/manakses/aplikasi/${id}/default-roles`, {
      role_ids: roleIds,
    });
  },

  /**
   * Read-only: list pengguna yg punya akses ke aplikasi.
   * Sumber UNION: identitas (default-role) + fungsional (menu_role) + universal (a_universal).
   */
  async getAksesPengguna(id: string, params: AksesPenggunaParams = {}): Promise<AksesPenggunaResult> {
    const response = await authClient.get<ApiResponse<AksesPenggunaResult>>(
      `/manakses/aplikasi/${id}/akses-pengguna`,
      { params }
    );
    return response.data.data;
  },
};

export default aplikasiService;
