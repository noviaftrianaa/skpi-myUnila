/**
 * KTW Service — Kelulusan Tepat Waktu
 *
 * Source of truth: pdut (SQL Server realtime).
 * Reconcile: spordit (PostgreSQL read-only).
 *
 * Backend endpoints: /api/v1/ktw/* (public-service)
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

export type JenjangKode = 'D3' | 'D4' | 'S1' | 'S2' | 'S3';

export interface KtwMeta {
  source: string;
  formula: string;
  masa_normatif_tahun: number;
  tolerance_tahun: number;
  jenjang: JenjangKode;
  as_of: string;
  note_cuti: string;
}

export interface KtwOverviewData {
  tahun: number | null;
  maba: number;
  sudah_lulus: number;
  ktw_strict: number;
  ktw_tolerant: number;
  masih_aktif: number;
  keluar_non_lulus: number;
  pct_ktw_strict: number;
  pct_ktw_tolerant: number;
  pct_survival: number;
  masa_normatif_tahun: number;
  tolerance_tahun: number;
}

export interface KtwFakultasRow {
  id_fakultas: string | null;
  nm_fakultas: string;
  maba: number;
  sudah_lulus: number;
  ktw_strict: number;
  ktw_tolerant: number;
  pct_ktw_strict: number;
  pct_ktw_tolerant: number;
  pct_survival: number;
}

export interface KtwProdiRow {
  id_prodi: string | null;
  kode_dikti: string | null;
  nm_prodi: string;
  id_fakultas: string | null;
  maba: number;
  sudah_lulus: number;
  ktw_strict: number;
  ktw_tolerant: number;
  pct_ktw_strict: number;
  pct_ktw_tolerant: number;
  pct_survival: number;
}

export interface KtwReconcileEntry {
  maba: number;
  sudah_lulus: number;
  ktw_strict: number;
  drift_maba: number;
  drift_ktw_strict: number;
  pct_drift_ktw: number;
  status: 'ok' | 'warning' | 'drift';
  note?: string;
  batch_tgl_generate?: string;
}

export interface KtwReconcile {
  spordit_raw: KtwReconcileEntry;
  spordit_batch: KtwReconcileEntry;
}

export interface KtwOverviewResponse {
  scope: string;
  cohort_year: number;
  jenjang: JenjangKode;
  data: KtwOverviewData;
  meta: KtwMeta;
  reconcile?: KtwReconcile;
}

export interface KtwFakultasResponse {
  scope: string;
  cohort_year: number;
  jenjang: JenjangKode;
  summary: Omit<KtwOverviewData, 'tahun' | 'masa_normatif_tahun' | 'tolerance_tahun' | 'masih_aktif' | 'keluar_non_lulus'>;
  data: KtwFakultasRow[];
  meta: KtwMeta;
}

export interface KtwProdiListResponse {
  scope: string;
  cohort_year: number;
  jenjang: JenjangKode;
  id_fakultas: string | null;
  summary: Omit<KtwOverviewData, 'tahun' | 'masa_normatif_tahun' | 'tolerance_tahun' | 'masih_aktif' | 'keluar_non_lulus'>;
  data: KtwProdiRow[];
  meta: KtwMeta;
}

export interface KtwProdiDetailResponse {
  scope: string;
  cohort_year: number;
  prodi: {
    id_prodi: string;
    kode_dikti: string;
    nm_prodi: string;
    id_fakultas: string;
    nm_fakultas: string;
    nm_jenjang: string;
  };
  jenjang: JenjangKode;
  overview: KtwOverviewData;
  meta: KtwMeta;
  reconcile?: KtwReconcile;
}

export interface KtwTrendResponse {
  scope: string;
  jenjang: JenjangKode;
  cohort_range: { start: number; end: number };
  data: KtwOverviewData[];
  meta: KtwMeta;
}

export interface KtwMahasiswaRow {
  nim: string;
  nama: string;
  angkatan: string | null;
  tgl_masuk_sp: string;
  tgl_keluar: string | null;
  ipk: number | null;
  id_jns_keluar: string | null;
  status_keluar: string;
  masa_mukim_tahun: number | null;
  is_ktw_strict: boolean;
  is_ktw_tolerant: boolean;
}

export interface KtwMahasiswaResponse {
  scope: string;
  cohort_year: number;
  id_prodi: string;
  jenjang: JenjangKode;
  data: KtwMahasiswaRow[];
  pagination: { total: number; per_page: number; current_page: number; last_page: number };
  meta: KtwMeta;
}

class KtwService {
  async getOverview(cohort?: number, jenjang: JenjangKode = 'S1', reconcile = false, cutoff?: string): Promise<KtwOverviewResponse> {
    const params: Record<string, string | number | boolean> = { jenjang };
    if (cohort) params.cohort = cohort;
    if (reconcile) params.reconcile = true;
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get<KtwOverviewResponse>(`${API_URL}/ktw/overview`, { params });
    return data;
  }

  async getByFakultas(cohort?: number, jenjang: JenjangKode = 'S1', cutoff?: string): Promise<KtwFakultasResponse> {
    const params: Record<string, string | number> = { jenjang };
    if (cohort) params.cohort = cohort;
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get<KtwFakultasResponse>(`${API_URL}/ktw/fakultas`, { params });
    return data;
  }

  async getByProdi(cohort?: number, jenjang: JenjangKode = 'S1', idFakultas?: string, cutoff?: string): Promise<KtwProdiListResponse> {
    const params: Record<string, string | number> = { jenjang };
    if (cohort) params.cohort = cohort;
    if (idFakultas) params.id_fakultas = idFakultas;
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get<KtwProdiListResponse>(`${API_URL}/ktw/prodi`, { params });
    return data;
  }

  async getProdiDetail(idSms: string, cohort: number, reconcile = true): Promise<KtwProdiDetailResponse> {
    const params: Record<string, string | number | boolean> = { cohort };
    if (reconcile) params.reconcile = true;
    const { data } = await axios.get<KtwProdiDetailResponse>(`${API_URL}/ktw/prodi/${idSms}`, { params });
    return data;
  }

  async getTrend(jenjang: JenjangKode = 'S1', start?: number, end?: number): Promise<KtwTrendResponse> {
    const params: Record<string, string | number> = { jenjang };
    if (start) params.start = start;
    if (end) params.end = end;
    const { data } = await axios.get<KtwTrendResponse>(`${API_URL}/ktw/trend`, { params });
    return data;
  }

  async getMahasiswaList(idSms: string, cohort: number, page = 1, perPage = 50): Promise<KtwMahasiswaResponse> {
    const { data } = await axios.get<KtwMahasiswaResponse>(`${API_URL}/ktw/prodi/${idSms}/mahasiswa`, {
      params: { cohort, page, per_page: perPage },
    });
    return data;
  }

  async getReconcile(cohort: number, jenjang: JenjangKode = 'S1') {
    const { data } = await axios.get(`${API_URL}/ktw/reconcile`, { params: { cohort, jenjang } });
    return data;
  }

  async getStatusBreakdown(cohort: number, jenjang: JenjangKode = 'S1', cutoff?: string) {
    const params: Record<string, string | number> = { cohort, jenjang };
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get(`${API_URL}/ktw/status-breakdown`, { params });
    return data as {
      data: Array<{ id_jns_keluar: string; nm_status: string; color: string; jumlah: number; persentase: number }>;
    };
  }

  async getGenderBreakdown(cohort: number, jenjang: JenjangKode = 'S1', cutoff?: string) {
    const params: Record<string, string | number> = { cohort, jenjang };
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get(`${API_URL}/ktw/gender-breakdown`, { params });
    return data as {
      data: Array<{ jk: string; nm_gender: string; color: string; maba: number; lulus: number; ktw_strict: number; pct_ktw: number }>;
    };
  }

  async getJalurBreakdown(cohort: number, jenjang: JenjangKode = 'S1', cutoff?: string) {
    const params: Record<string, string | number> = { cohort, jenjang };
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get(`${API_URL}/ktw/jalur-breakdown`, { params });
    return data as {
      data: Array<{ id_jalur_daftar: string; nm_jalur: string; maba: number; lulus: number; ktw: number; pct_ktw: number; pct_survival: number }>;
    };
  }

  async getMasaMukimStats(cohort: number, jenjang: JenjangKode = 'S1', cutoff?: string) {
    const params: Record<string, string | number> = { cohort, jenjang };
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get(`${API_URL}/ktw/masa-mukim-stats`, { params });
    return data as {
      data: { jumlah_lulusan: number; avg_masa: number; min_masa: number; max_masa: number; stddev_masa: number; masa_normatif_tahun: number };
    };
  }

  async refreshCache() {
    const { data } = await axios.post(`${API_URL}/ktw/refresh`);
    return data as { success: boolean; cleared_keys: number; as_of: string };
  }

  async getPresets() {
    const { data } = await axios.get(`${API_URL}/ktw/presets`);
    return data as {
      data: Array<{ group: string; label: string; value: string; id_smt: string | null; aktif: boolean }>;
      as_of: string;
    };
  }

  async getTopProdi(cohort: number, jenjang: JenjangKode = 'S1', limit = 10, cutoff?: string) {
    const params: Record<string, string | number> = { cohort, jenjang, limit };
    if (cutoff) params.cutoff = cutoff;
    const { data } = await axios.get(`${API_URL}/ktw/top-prodi`, { params });
    return data as { data: KtwProdiRow[] };
  }
}

export const ktwService = new KtwService();
