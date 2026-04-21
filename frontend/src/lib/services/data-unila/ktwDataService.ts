/**
 * Data Unila — KTW Raw Data Service
 *
 * Call public-service /ktw/* endpoints directly (single source of truth, sama dgn infografis public + dashboard pimpinan).
 * Untuk raw-data export: flat list mahasiswa angkatan lintas semua prodi + rekap per fakultas/prodi.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : "http://localhost:9800/public-service/api/v1";

export type JenjangKode = "D3" | "D4" | "S1" | "S2" | "S3";

export interface KtwMahasiswaFlatRow {
  nim: string;
  nama: string;
  jenis_kelamin: string;
  angkatan: string | number;
  id_prodi: string;
  nm_prodi: string;
  kode_dikti: string | null;
  id_fakultas: string;
  nm_fakultas: string;
  nm_jenjang: string;
  id_jalur_daftar: string | null;
  nm_jalur_daftar: string;
  tgl_masuk_sp: string;
  tgl_keluar: string | null;
  ipk: number | null;
  id_jns_keluar: string | null;
  status_keluar: string;
  masa_mukim_tahun: number | null;
  is_ktw_strict: boolean;
  is_ktw_tolerant: boolean;
}

export interface KtwMahasiswaFlatParams {
  cohort: number;
  jenjang?: JenjangKode;
  cutoff?: string;
  id_fakultas?: string;
  id_prodi?: string;
  status_keluar?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface KtwMahasiswaFlatResponse {
  scope: string;
  cohort_year: number;
  jenjang: JenjangKode;
  filters: Record<string, string | null>;
  data: KtwMahasiswaFlatRow[];
  pagination: { total: number; per_page: number; current_page: number; last_page: number };
  meta: {
    source: string;
    formula: string;
    masa_normatif_tahun: number;
    tolerance_tahun: number;
    as_of: string;
    [k: string]: unknown;
  };
}

export interface KtwRekapFakultasRow {
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

export interface KtwRekapProdiRow {
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

export const ktwDataService = {
  async getMahasiswaFlat(params: KtwMahasiswaFlatParams): Promise<KtwMahasiswaFlatResponse> {
    const { data } = await axios.get<KtwMahasiswaFlatResponse>(`${API_URL}/ktw/mahasiswa`, { params });
    return data;
  },

  async getFakultasRekap(params: { cohort: number; jenjang?: JenjangKode; cutoff?: string }) {
    const { data } = await axios.get<{ data: KtwRekapFakultasRow[] }>(`${API_URL}/ktw/fakultas`, { params });
    return data.data;
  },

  async getProdiRekap(params: { cohort: number; jenjang?: JenjangKode; cutoff?: string; id_fakultas?: string }) {
    const { data } = await axios.get<{ data: KtwRekapProdiRow[] }>(`${API_URL}/ktw/prodi`, { params });
    return data.data;
  },

  async getPresets() {
    const { data } = await axios.get<{ data: Array<{ group: string; label: string; value: string }> }>(`${API_URL}/ktw/presets`);
    return data.data;
  },
};

export default ktwDataService;
