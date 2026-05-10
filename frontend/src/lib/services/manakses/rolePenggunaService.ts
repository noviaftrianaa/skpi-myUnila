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

  // =========================================================================
  // Kandidat Review & Perpanjangan (Phase 1.5)
  // =========================================================================

  /**
   * GET /role-pengguna/kandidat
   * List role_pengguna yg perlu di-review oleh admin TIK by kategori.
   */
  async getKandidat(params: KandidatParams): Promise<KandidatResult> {
    const response = await authClient.get<ApiResponse<KandidatResult>>(
      `/manakses/role-pengguna/kandidat`,
      { params }
    );
    return response.data.data;
  },

  /**
   * PUT /role-pengguna/{id}/perpanjang
   * Perpanjang masa berlaku 1 role_pengguna.
   */
  async perpanjang(id: string, data: PerpanjangData): Promise<{ id_role_pengguna: string; tgl_kadaluarsa: string }> {
    const response = await authClient.put<ApiResponse<{ id_role_pengguna: string; tgl_kadaluarsa: string }>>(
      `/manakses/role-pengguna/${id}/perpanjang`,
      data
    );
    return response.data.data;
  },

  /**
   * POST /role-pengguna/perpanjang-batch
   * Perpanjang bulk (max 500 ids).
   */
  async perpanjangBatch(ids: string[], data: PerpanjangData): Promise<{ updated: number; requested: number }> {
    const response = await authClient.post<ApiResponse<{ updated: number; requested: number }>>(
      `/manakses/role-pengguna/perpanjang-batch`,
      { ids, ...data }
    );
    return response.data.data;
  },

  /**
   * POST /role-pengguna/revoke-batch
   * Soft-delete bulk role_pengguna dengan alasan.
   */
  async revokeBatch(ids: string[], alasan: string): Promise<{ deleted: number; requested: number }> {
    const response = await authClient.post<ApiResponse<{ deleted: number; requested: number }>>(
      `/manakses/role-pengguna/revoke-batch`,
      { ids, alasan }
    );
    return response.data.data;
  },

  /**
   * GET /role-pengguna/import-template?id_aplikasi=...
   * Returns CSV blob untuk download template.
   */
  async getImportTemplate(idAplikasi?: string): Promise<Blob> {
    const response = await authClient.get(`/manakses/role-pengguna/import-template`, {
      params: idAplikasi ? { id_aplikasi: idAplikasi } : {},
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * POST /role-pengguna/import
   * Upload CSV — dry_run=true returns preview, false = commit.
   */
  async importBulk(file: File, dryRun: boolean, idAplikasi?: string): Promise<ImportResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("dry_run", dryRun ? "1" : "0");
    if (idAplikasi) form.append("id_aplikasi", idAplikasi);
    const response = await authClient.post<ApiResponse<ImportResult>>(
      `/manakses/role-pengguna/import`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },
};

export interface ImportPreviewRow {
  line: number;
  status: "ok" | "error" | "duplikat";
  errors: string[];
  username: string;
  id_pengguna: string | null;
  id_peran: number | null;
  nm_peran: string | null;
  id_organisasi: string | null;
  no_sk: string | null;
  tgl_sk: string | null;
  tgl_kadaluarsa: string;
  keterangan: string | null;
}

export interface ImportResult {
  dry_run: boolean;
  total_rows: number;
  rows_ok?: number;
  rows_error?: number;
  rows_duplikat?: number;
  inserted?: number;
  preview?: ImportPreviewRow[];
}

// =========================================================================
// Types: Kandidat & Perpanjangan
// =========================================================================

export type KandidatKategori = "alumni" | "mutasi" | "expired" | "akan_expire" | "tanpa_kadaluarsa";

export interface KandidatItem {
  id_role_pengguna: string;
  id_pengguna: string;
  nm_pengguna: string;
  username: string;
  email: string | null;
  id_peran: number;
  nm_peran: string;
  a_peran_identitas: boolean;
  a_universal: boolean;
  id_organisasi: string | null;
  nm_organisasi: string | null;
  sk_penugasan: string | null;
  tgl_sk_penugasan: string | null;
  tgl_kadaluarsa: string | null;
  last_active: string | null;
  tgl_create: string | null;
  // Kategori-specific extras (alumni / mutasi)
  tgl_lulus?: string | null;
  tgl_keluar?: string | null;
  sk_yudisium?: string | null;
  id_jns_keluar?: number | null;
  nm_jns_keluar?: string | null;
  // Expired/akan_expire extras
  days_overdue?: number | null;
  days_remaining?: number | null;
}

export interface KandidatResult {
  kategori: KandidatKategori;
  data: KandidatItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface KandidatParams {
  kategori: KandidatKategori;
  search?: string;
  page?: number;
  limit?: number;
  days?: number;
}

export interface PerpanjangData {
  tgl_kadaluarsa: string;
  sk_penugasan?: string;
  tgl_sk_penugasan?: string;
  alasan?: string;
}

export default rolePenggunaService;
