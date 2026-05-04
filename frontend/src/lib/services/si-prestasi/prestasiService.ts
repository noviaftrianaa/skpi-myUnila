/**
 * Service CRUD SI-Prestasi — prestasi mandiri, sertifikasi, rekognisi, lookup, files.
 */
import { simPrestasiClient } from "./client";
import type {
  PrestasiMandiri,
  Sertifikasi,
  Rekognisi,
  PaginatedResponse,
  PaginationMeta,
  MahasiswaLookup,
  DosenLookup,
  FileUploadResponse,
  WorkflowStatus,
  RefLevel,
  RefKategori,
  RefPeringkat,
  RefKelompok,
  RefBentuk,
  RefJenisRekognisi,
} from "./types";

type ListParams = {
  tahun?: number | string;
  id_fakultas?: string;
  id_jenis_rekognisi?: string;
  status_workflow?: WorkflowStatus | "";
  search?: string;
  page?: number;
  limit?: number;
};

function cleanParams(p: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

// Unwrap {data, pagination} from paginated response
function unwrapPaginated<T>(resp: { data: PaginatedResponse<T> }): { data: T[]; pagination: PaginationMeta } {
  return { data: resp.data.data, pagination: resp.data.pagination };
}

export const prestasiMandiriService = {
  async list(params: ListParams = {}) {
    const r = await simPrestasiClient.get<PaginatedResponse<PrestasiMandiri>>("/v1/prestasi-mandiri", { params: cleanParams(params) });
    return unwrapPaginated({ data: r.data });
  },

  async detail(id: string): Promise<PrestasiMandiri> {
    const r = await simPrestasiClient.get<{ data: PrestasiMandiri }>(`/v1/prestasi-mandiri/${id}`);
    return r.data.data;
  },

  async create(payload: Partial<PrestasiMandiri>): Promise<PrestasiMandiri> {
    const r = await simPrestasiClient.post<{ data: PrestasiMandiri }>("/v1/prestasi-mandiri", payload);
    return r.data.data;
  },

  async update(id: string, payload: Partial<PrestasiMandiri>): Promise<PrestasiMandiri> {
    const r = await simPrestasiClient.put<{ data: PrestasiMandiri }>(`/v1/prestasi-mandiri/${id}`, payload);
    return r.data.data;
  },

  async softDelete(id: string): Promise<void> {
    await simPrestasiClient.delete(`/v1/prestasi-mandiri/${id}`);
  },

  async transition(id: string, status: WorkflowStatus): Promise<PrestasiMandiri> {
    const r = await simPrestasiClient.post<{ data: PrestasiMandiri }>(`/v1/prestasi-mandiri/${id}/transition`, { status });
    return r.data.data;
  },
};

export const sertifikasiService = {
  async list(params: ListParams = {}) {
    const r = await simPrestasiClient.get<PaginatedResponse<Sertifikasi>>("/v1/sertifikasi", { params: cleanParams(params) });
    return unwrapPaginated({ data: r.data });
  },

  async detail(id: string): Promise<Sertifikasi> {
    const r = await simPrestasiClient.get<{ data: Sertifikasi }>(`/v1/sertifikasi/${id}`);
    return r.data.data;
  },

  async create(payload: Partial<Sertifikasi>): Promise<Sertifikasi> {
    const r = await simPrestasiClient.post<{ data: Sertifikasi }>("/v1/sertifikasi", payload);
    return r.data.data;
  },

  async update(id: string, payload: Partial<Sertifikasi>): Promise<Sertifikasi> {
    const r = await simPrestasiClient.put<{ data: Sertifikasi }>(`/v1/sertifikasi/${id}`, payload);
    return r.data.data;
  },

  async softDelete(id: string): Promise<void> {
    await simPrestasiClient.delete(`/v1/sertifikasi/${id}`);
  },

  async transition(id: string, status: WorkflowStatus): Promise<Sertifikasi> {
    const r = await simPrestasiClient.post<{ data: Sertifikasi }>(`/v1/sertifikasi/${id}/transition`, { status });
    return r.data.data;
  },
};

export const rekognisiService = {
  async list(params: ListParams = {}) {
    const r = await simPrestasiClient.get<PaginatedResponse<Rekognisi>>("/v1/rekognisi", { params: cleanParams(params) });
    return unwrapPaginated({ data: r.data });
  },

  async detail(id: string): Promise<Rekognisi> {
    const r = await simPrestasiClient.get<{ data: Rekognisi }>(`/v1/rekognisi/${id}`);
    return r.data.data;
  },

  async create(payload: Partial<Rekognisi>): Promise<Rekognisi> {
    const r = await simPrestasiClient.post<{ data: Rekognisi }>("/v1/rekognisi", payload);
    return r.data.data;
  },

  async update(id: string, payload: Partial<Rekognisi>): Promise<Rekognisi> {
    const r = await simPrestasiClient.put<{ data: Rekognisi }>(`/v1/rekognisi/${id}`, payload);
    return r.data.data;
  },

  async softDelete(id: string): Promise<void> {
    await simPrestasiClient.delete(`/v1/rekognisi/${id}`);
  },

  async transition(id: string, status: WorkflowStatus): Promise<Rekognisi> {
    const r = await simPrestasiClient.post<{ data: Rekognisi }>(`/v1/rekognisi/${id}/transition`, { status });
    return r.data.data;
  },
};

export const lookupService = {
  async mahasiswaByNim(nim: string): Promise<MahasiswaLookup | null> {
    try {
      const r = await simPrestasiClient.get<{ data: MahasiswaLookup }>("/lookup/mahasiswa", { params: { nim } });
      return r.data.data;
    } catch { return null; }
  },

  async searchMahasiswa(q: string, limit = 10): Promise<MahasiswaLookup[]> {
    if (!q || q.length < 2) return [];
    const r = await simPrestasiClient.get<{ data: MahasiswaLookup[] }>("/lookup/mahasiswa/search", { params: { q, limit } });
    return r.data.data ?? [];
  },

  async dosenByIdentifier(identifier: string): Promise<DosenLookup | null> {
    try {
      const r = await simPrestasiClient.get<{ data: DosenLookup }>("/lookup/dosen", { params: { identifier } });
      return r.data.data;
    } catch { return null; }
  },

  async searchDosen(q: string, limit = 10): Promise<DosenLookup[]> {
    if (!q || q.length < 2) return [];
    const r = await simPrestasiClient.get<{ data: DosenLookup[] }>("/lookup/dosen/search", { params: { q, limit } });
    return r.data.data ?? [];
  },

  async listFakultas(): Promise<Array<{ id: string; nama: string }>> {
    const r = await simPrestasiClient.get<{ data: Array<{ id: string; nama: string }> }>("/lookup/fakultas");
    return r.data.data ?? [];
  },
};

export const fileService = {
  async upload(file: File, parent_tipe: string, jenis: string, id_parent?: string): Promise<FileUploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("parent_tipe", parent_tipe);
    form.append("jenis", jenis);
    if (id_parent) form.append("id_parent", id_parent);

    const r = await simPrestasiClient.post<{ data: FileUploadResponse }>("/v1/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.data;
  },

  async delete(path: string): Promise<void> {
    await simPrestasiClient.delete("/v1/files", { data: { path } });
  },
};

/**
 * Master data referensi — hit endpoint backend (belum ada, akan ditambahkan).
 * Sementara return empty array, atau kalau backend siap bisa hit /v1/master-data/*
 */
// Tipe ref untuk CRUD param. Used by refService.create/update/delete.
export type RefTipe = "level" | "kategori" | "peringkat" | "kelompok" | "bentuk" | "jenis_rekognisi";

export interface RefSyncReport {
  level_prestasi: { fetched: number; inserted: number; matched: number; rows: any[] };
  kategori_prestasi: { fetched: number; inserted: number; matched: number; rows: any[] };
  summary: { total_fetched: number; total_inserted: number; total_matched: number; finished_at: string };
}

export const refService = {
  async levels(): Promise<RefLevel[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefLevel[] }>("/v1/master-data/level-prestasi");
      return r.data.data ?? [];
    } catch { return []; }
  },
  async kategori(): Promise<RefKategori[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefKategori[] }>("/v1/master-data/kategori-prestasi");
      return r.data.data ?? [];
    } catch { return []; }
  },
  async peringkat(): Promise<RefPeringkat[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefPeringkat[] }>("/v1/master-data/peringkat");
      return r.data.data ?? [];
    } catch { return []; }
  },
  async kelompok(): Promise<RefKelompok[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefKelompok[] }>("/v1/master-data/kelompok-prestasi");
      return r.data.data ?? [];
    } catch { return []; }
  },
  async bentuk(): Promise<RefBentuk[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefBentuk[] }>("/v1/master-data/bentuk-pelaksanaan");
      return r.data.data ?? [];
    } catch { return []; }
  },
  async jenisRekognisi(): Promise<RefJenisRekognisi[]> {
    try {
      const r = await simPrestasiClient.get<{ data: RefJenisRekognisi[] }>("/v1/master-data/jenis-rekognisi");
      return r.data.data ?? [];
    } catch { return []; }
  },

  // Sync dari pdut.ref.tingkat_prestasi + jenis_prestasi → si_prestasi.ref.*
  async syncFromPdut(): Promise<RefSyncReport> {
    const r = await simPrestasiClient.post<{ success: boolean; data: RefSyncReport }>("/v1/master-data/sync");
    return r.data.data;
  },

  // CRUD admin per ref tipe
  async create(tipe: RefTipe, payload: Record<string, any>): Promise<{ id: string }> {
    const r = await simPrestasiClient.post<{ success: boolean; data: { id: string } }>(`/v1/master-data/${tipe}`, payload);
    return r.data.data;
  },
  async update(tipe: RefTipe, id: string, payload: Record<string, any>): Promise<void> {
    await simPrestasiClient.put(`/v1/master-data/${tipe}/${id}`, payload);
  },
  async remove(tipe: RefTipe, id: string): Promise<void> {
    await simPrestasiClient.delete(`/v1/master-data/${tipe}/${id}`);
  },
};

// =====================================================================
// API Config (SIMKATMAWA credentials) — admin setting page
// =====================================================================

export interface ApiConfig {
  id_api_config: string;
  kode: string;
  nm_api: string;
  base_url: string;
  auth_type: string;
  auth_login_path: string | null;
  kode_pt: string | null;
  rate_limit_per_min: number;
  timeout_seconds: number;
  retry_policy: any;
  a_active: boolean;
  a_dry_run: boolean;
  deskripsi: string | null;
  has_username: boolean;
  has_password: boolean;
  has_api_key: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiConfigUpdateReq {
  username?: string;
  password?: string;
  api_key?: string;
  base_url?: string;
  kode_pt?: string;
  rate_limit?: number;
  timeout?: number;
  a_active?: boolean;
  a_dry_run?: boolean;
}

export const apiConfigService = {
  async list(): Promise<ApiConfig[]> {
    const r = await simPrestasiClient.get<{ success: boolean; data: ApiConfig[] }>("/v1/master-data/api-config");
    return r.data.data ?? [];
  },
  async get(kode: string): Promise<ApiConfig> {
    const r = await simPrestasiClient.get<{ success: boolean; data: ApiConfig }>(`/v1/master-data/api-config/${kode}`);
    return r.data.data;
  },
  async update(kode: string, req: ApiConfigUpdateReq): Promise<ApiConfig> {
    const r = await simPrestasiClient.put<{ success: boolean; data: ApiConfig }>(`/v1/master-data/api-config/${kode}`, req);
    return r.data.data;
  },
  async toggle(kode: string, flag: "a_active" | "a_dry_run", value: boolean): Promise<ApiConfig> {
    const r = await simPrestasiClient.post<{ success: boolean; data: ApiConfig }>(`/v1/master-data/api-config/${kode}/toggle`, { flag, value });
    return r.data.data;
  },
  async ping(): Promise<any> {
    const r = await simPrestasiClient.post<{ success: boolean; data: any }>(`/v1/sync/ping`);
    return r.data;
  },
};

// =====================================================================
// Sync ke SIMKATMAWA (Phase 2)
// =====================================================================

export type ParentTipe = "PRESTASI" | "SERTIFIKASI" | "REKOGNISI";

export interface SyncSubmission {
  id_submission: string;
  id_parent: string;
  parent_tipe: ParentTipe;
  tipe_sync_kode: string;
  nm_tipe_sync: string;
  request_at: string;
  http_status: number | null;
  simkatmawa_id: number | null;
  simkatmawa_kode_pt: string | null;
  error_message: string | null;
  retry_count: number;
  a_success: boolean;
  id_actor: string | null;
}

export interface SyncSubmissionDetail extends SyncSubmission {
  request_payload: Record<string, unknown> | null;
  response_body: Record<string, unknown> | null;
}

export interface SyncLogParams {
  parent_tipe?: ParentTipe;
  id_parent?: string;
  success_only?: boolean;
  page?: number;
  limit?: number;
}

export interface SyncPingResult {
  ok: boolean;
  message: string;
  kode_pt?: string | null;
  token_preview?: string | null;
  dry_run: boolean;
}

export const syncService = {
  /**
   * Trigger submit job (async). Backend dispatch SubmitToSimkatmawaJob ke
   * queue 'simkatmawa'. Status 202 berarti queued — cek log untuk hasil.
   */
  async submit(type: "prestasi" | "sertifikasi" | "rekognisi", id: string): Promise<{ id_parent: string; parent_tipe: ParentTipe; queued_at: string }> {
    const r = await simPrestasiClient.post<{ success: boolean; data: { id_parent: string; parent_tipe: ParentTipe; queued_at: string } }>(
      `/v1/sync/submit/${type}/${id}`
    );
    return r.data.data;
  },

  async log(params: SyncLogParams = {}): Promise<{ data: SyncSubmission[]; pagination: PaginationMeta }> {
    const r = await simPrestasiClient.get<{ data: SyncSubmission[]; meta: PaginationMeta }>("/v1/sync/log", {
      params: cleanParams(params as Record<string, unknown>),
    });
    return { data: r.data.data, pagination: r.data.meta };
  },

  async logDetail(idSubmission: string): Promise<SyncSubmissionDetail> {
    const r = await simPrestasiClient.get<{ data: SyncSubmissionDetail }>(`/v1/sync/log/${idSubmission}`);
    return r.data.data;
  },

  async ping(): Promise<SyncPingResult> {
    const r = await simPrestasiClient.post<{ data: SyncPingResult }>("/v1/sync/ping");
    return r.data.data;
  },
};
