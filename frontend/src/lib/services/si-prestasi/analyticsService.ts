/**
 * Analytics service — Phase 4 dashboard pimpinan SI-Prestasi.
 *
 * Semua endpoint di-cache Redis 5 menit di backend. Filter via query string.
 * Endpoint: /api/v1/analytics/* (JWT-protected).
 */
import { simPrestasiClient } from "./client";

export type AnalyticsTipe = "all" | "prestasi" | "sertifikasi" | "rekognisi";

export type AnalyticsFilters = {
  tahun?: number;
  tipe?: AnalyticsTipe;
  id_fakultas?: string;
  status_workflow?: string;
};

export type Overview = {
  prestasi: number;
  sertifikasi: number;
  rekognisi: number;
  total: number;
  sync_success: number;
  sync_total: number;
  sync_pct: number;
  skor_bobot: number;
};

export type TrendRow = { tahun: number; prestasi: number; sertifikasi: number; rekognisi: number };
export type ByTipe = { name: string; value: number };
export type ByLevel = { kode: string; nama: string; jumlah: number };
export type ByKategori = { kode: string; nama: string; jumlah: number };
export type ByPeringkat = { kode: string; nama: string; bobot: number; jumlah: number; skor: number };
export type ByFakultas = { id_fakultas: string; nm_fakultas: string; jumlah: number };
export type ByProdi = { id_sms_pdut: string; nm_prodi: string; jumlah: number };
export type TopMahasiswa = { nim: string; nm_mahasiswa: string; nm_prodi: string; jumlah: number };
export type WorkflowPipeline = { status: string; jumlah: number };
export type MatrixCell = { kategori: string; level: string; jumlah: number };

export type SyncHealth = {
  total: number;
  success: number;
  failed: number;
  retried: number;
  avg_retry: number;
  success_pct: number;
  last_at: string | null;
  by_tipe: { parent_tipe: string; success: number; total: number; success_pct: number }[];
};

export type MahasiswaProdiRow = {
  nim: string;
  nm_mahasiswa: string;
  parent_tipe: string;
  id_parent: string;
  judul: string;
  thn_prestasi: number;
  status_workflow: string;
};

export type MahasiswaProdiResponse = {
  data: MahasiswaProdiRow[];
  page: number;
  last_page: number;
  total: number;
};

function clean(p: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

async function get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const r = await simPrestasiClient.get<{ success: boolean; data: T }>(path, { params: clean(params) });
  return r.data.data;
}

export const analyticsService = {
  overview: (f: AnalyticsFilters = {}) => get<Overview>("/v1/analytics/overview", f),
  trend: (years = 5) => get<TrendRow[]>("/v1/analytics/trend", { years }),
  byTipe: (f: AnalyticsFilters = {}) => get<ByTipe[]>("/v1/analytics/by-tipe", f),
  byLevel: (f: AnalyticsFilters = {}) => get<ByLevel[]>("/v1/analytics/by-level", f),
  byKategori: (f: AnalyticsFilters = {}) => get<ByKategori[]>("/v1/analytics/by-kategori", f),
  byPeringkat: (f: AnalyticsFilters = {}) => get<ByPeringkat[]>("/v1/analytics/by-peringkat", f),
  byFakultas: (f: AnalyticsFilters = {}) => get<ByFakultas[]>("/v1/analytics/by-fakultas", f),
  byProdi: (f: AnalyticsFilters = {}) => get<ByProdi[]>("/v1/analytics/by-prodi", f),
  topMahasiswa: (f: AnalyticsFilters = {}, limit = 10) => get<TopMahasiswa[]>("/v1/analytics/top-mahasiswa", { ...f, limit }),
  syncHealth: () => get<SyncHealth>("/v1/analytics/sync-health"),
  workflowPipeline: (f: AnalyticsFilters = {}) => get<WorkflowPipeline[]>("/v1/analytics/workflow-pipeline", f),
  matrixKategoriLevel: (f: AnalyticsFilters = {}) => get<MatrixCell[]>("/v1/analytics/matrix-kategori-level", f),
  mahasiswaProdi: (idSmsPdut: string, f: AnalyticsFilters = {}, page = 1, limit = 50) =>
    get<MahasiswaProdiResponse>(`/v1/analytics/mahasiswa-prodi/${idSmsPdut}`, { ...f, page, limit }),
  refreshCache: async () => {
    const r = await simPrestasiClient.post<{ success: boolean; data: { flushed: number } }>("/v1/analytics/refresh-cache");
    return r.data.data;
  },
};
