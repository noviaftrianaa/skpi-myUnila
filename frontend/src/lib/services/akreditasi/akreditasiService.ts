/**
 * Akreditasi service — client untuk myunila-service /v1/akreditasi/*.
 * Path lewat Kong: /myunila-service/api/v1/akreditasi.
 */
import axios, { type AxiosInstance } from "axios";

const ROOT =
  process.env.NEXT_PUBLIC_MYUNILA_API_URL ||
  "http://localhost:9800/myunila-service";
const BASE_URL = ROOT.replace(/\/$/, "") + "/api/v1";

export const akrClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, // BAN-PT fetch bisa 2 menit
  headers: { "Content-Type": "application/json" },
});

akrClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Konsisten dengan TOKEN_KEYS.ACCESS = "auth_access_token" di lib/api/client.ts
    const token =
      localStorage.getItem("auth_access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ============================================================================
// Types
// ============================================================================

export interface AkreditasiRow {
  id_sms: string;
  nm_prodi: string;
  nm_jenj_didik: string | null;
  kode_prodi: string | null;
  nm_fakultas: string | null;
  id_lemb_akred: string | null;
  nm_lemb_akred: string | null;
  id_akred: number | null;
  nm_akred: string | null;
  sk_akreditasi: string | null;
  tanggal_sk: string | null;
  tst_sk: string | null;
  asal_data: string | null;
  last_update: string | null;
}

export interface AkreditasiStats {
  total_prodi: number;
  total_terakreditasi: number;
  total_kadaluarsa: number;
  total_akan_kadaluarsa: number;
  total_belum: number;
  by_akreditasi: Record<string, number>;
  last_sync_at: string | null;
  last_sync_status: string | null;
}

export interface SyncLogDetail {
  id_detail: string;
  id_log: string;
  id_sms: string | null;
  nm_prodi_external: string | null;
  jenjang_external: string | null;
  nm_prodi_pdrd: string | null;
  jenjang_pdrd: string | null;
  action: "insert" | "update" | "unchanged" | "unmatched" | "skipped" | "error";
  old_id_akred: number | null;
  new_id_akred: number | null;
  old_nm_akred: string | null;
  new_nm_akred: string | null;
  old_sk: string | null;
  new_sk: string | null;
  old_tgl_sk: string | null;
  new_tgl_sk: string | null;
  old_tst_sk: string | null;
  new_tst_sk: string | null;
  id_lemb_akred: string | null;
  notes: string | null;
}

export interface SyncResult {
  id_log: string;
  sumber: string;
  mode: "preview" | "apply";
  status: "running" | "success" | "failed";
  started_at: string;
  finished_at: string;
  duration_ms: number;
  total_fetched: number;
  total_matched: number;
  total_unmatched: number;
  total_inserted: number;
  total_updated: number;
  total_unchanged: number;
  changes: SyncLogDetail[];
  error?: string;
}

export interface SyncLogRow {
  id_log: string;
  sumber: string;
  mode: string;
  triggered_by: string | null;
  triggered_username: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  total_fetched: number | null;
  total_matched: number | null;
  total_unmatched: number | null;
  total_inserted: number | null;
  total_updated: number | null;
  total_unchanged: number | null;
  error_message: string | null;
}

export interface SchedulerConfig {
  enabled: boolean;
  cron: string;
  description: string;
  updated_at: string;
}

// Mapping Unit page = list pdrd.sms (active + has fakultas) dengan status akreditasi
// + CRUD manual akreditasi per prodi.
export interface MappingStats {
  total: number;
  mapped: number;     // ada akreditasi aktif (bukan "Belum/Tidak Terakreditasi")
  unmapped: number;   // belum ada akreditasi atau status "Belum Terakreditasi"
  expired: number;    // tst_sk < today
}

export interface ManualAkreditasiUpsertReq {
  id_sms: string;
  id_lemb_akred: string;
  id_akred: number;
  sk: string;
  tgl_sk?: string | null;  // YYYY-MM-DD
  tst_sk?: string | null;  // YYYY-MM-DD
  banpt_name?: string;     // Optional: simpan alias supaya sync berikutnya match
  banpt_jenjang?: string;
}

export interface RefRow {
  id: string;
  nama: string;
}

export interface RefAkreditasiData {
  nilai_akred: RefRow[];
  lembaga_akred: RefRow[];
}

// ============================================================================
// API
// ============================================================================

const akreditasiService = {
  async list(params: {
    search?: string;
    id_lemb_akred?: string;
    id_akred?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: string;
  } = {}) {
    const r = await akrClient.get<{ success: boolean; data: AkreditasiRow[]; pagination: { page: number; limit: number; total: number } }>("/akreditasi", { params });
    return r.data;
  },

  async stats() {
    const r = await akrClient.get<{ success: boolean; data: AkreditasiStats }>("/akreditasi/stats");
    return r.data.data;
  },

  async sync(mode: "preview" | "apply" = "preview") {
    const r = await akrClient.post<{ success: boolean; data: SyncResult; message?: string }>("/akreditasi/sync", { mode });
    return r.data;
  },

  async listLogs(params: { page?: number; limit?: number } = {}) {
    const r = await akrClient.get<{ success: boolean; data: SyncLogRow[]; pagination: { page: number; limit: number; total: number } }>("/akreditasi/sync-log", { params });
    return r.data;
  },

  async logDetails(idLog: string, action?: string) {
    const r = await akrClient.get<{ success: boolean; data: SyncLogDetail[] }>(
      `/akreditasi/sync-log/${idLog}/details`,
      { params: action ? { action } : {} }
    );
    return r.data.data;
  },

  async schedulerConfig() {
    const r = await akrClient.get<{ success: boolean; data: SchedulerConfig }>("/akreditasi/scheduler-config");
    return r.data.data;
  },

  // ---- Mapping Unit page (list pdrd.sms + akreditasi status + CRUD manual) ----
  async listMapping(params: {
    search?: string;
    status?: "all" | "mapped" | "unmapped" | "expired";
    id_lemb_akred?: string;
    id_akred?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: string;
  } = {}) {
    const r = await akrClient.get<{ success: boolean; data: AkreditasiRow[]; pagination: { page: number; limit: number; total: number } }>("/akreditasi/mapping-unit", { params });
    return r.data;
  },
  async mappingStats() {
    const r = await akrClient.get<{ success: boolean; data: MappingStats }>("/akreditasi/mapping-unit/stats");
    return r.data.data;
  },
  async upsertMapping(req: ManualAkreditasiUpsertReq) {
    const r = await akrClient.put<{ success: boolean; data: { action: string; id_sms: string } }>(
      `/akreditasi/mapping-unit/${encodeURIComponent(req.id_sms)}`,
      req
    );
    return r.data.data;
  },
  async deleteMapping(idSms: string) {
    const r = await akrClient.delete<{ success: boolean }>(`/akreditasi/mapping-unit/${encodeURIComponent(idSms)}`);
    return r.data.success;
  },
  async refAkreditasi() {
    const r = await akrClient.get<{ success: boolean; data: RefAkreditasiData }>("/akreditasi/ref-akreditasi");
    return r.data.data;
  },

  async unmatched() {
    const r = await akrClient.get<{ success: boolean; data: UnmatchedRow[] }>("/akreditasi/unmatched");
    return r.data.data;
  },
};

export interface UnmatchedRow {
  nm_prodi_banpt: string;
  jenjang_banpt: string;
  new_id_akred: number | null;
  new_nm_akred: string | null;
  new_sk: string | null;
  new_tst_sk: string | null; // YYYY-MM-DD
  id_log: string;
  started_at: string;
}

export default akreditasiService;
