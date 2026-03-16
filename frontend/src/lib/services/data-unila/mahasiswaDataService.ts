/**
 * Data Unila — Mahasiswa Service
 * Raw data mahasiswa dengan server-side pagination, filter, export
 */
import { dashboardClient } from '@/lib/api/dashboardClient';

export interface MahasiswaItem {
  id_pd: string;
  id_reg_pd: string;
  nipd: string;
  nm_pd: string;
  jk: string;
  nik: string;
  nisn: string;
  tmpt_lahir: string;
  tgl_lahir: string;
  nm_prodi: string;
  jenjang: string;
  nm_fakultas: string;
  id_fakultas: string;
  id_sms: string;
  angkatan: string;
  id_semester_masuk: string;
  status: string;
  tgl_keluar: string | null;
  nm_agama: string;
  email: string;
  tlpn_hp: string;
}

export interface MahasiswaDetail extends MahasiswaItem {
  ipk: string | null;
  nm_wilayah: string;
  jln: string;
  rt: number;
  rw: number;
  nm_dsn: string;
  ds_kel: string;
  kode_pos: string;
  nm_ayah: string;
  nm_ibu: string;
}

export interface MahasiswaStats {
  total: string;
  aktif: string;
  lulus: string;
  do_keluar: string;
  cuti: string;
  total_prodi: string;
  total_fakultas: string;
}

export interface MahasiswaListResult {
  data: MahasiswaItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MahasiswaFilters {
  angkatan: Array<{ angkatan: string }>;
  fakultas: Array<{ id_fakultas: string; nm_fakultas: string }>;
  prodi: Array<{ id_sms: string; nm_prodi: string; jenjang: string }>;
}

export interface MahasiswaListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  id_fakultas?: string;
  id_prodi?: string;
  angkatan?: string;
  semester?: string;
  status?: string;
}

export const mahasiswaDataService = {
  async getList(params: MahasiswaListParams): Promise<MahasiswaListResult> {
    const response = await dashboardClient.get('/data/mahasiswa', { params });
    return response.data.data;
  },

  async getStats(params: Omit<MahasiswaListParams, 'page' | 'limit' | 'sort_by' | 'sort_order'>): Promise<MahasiswaStats> {
    const response = await dashboardClient.get('/data/mahasiswa/stats', { params });
    return response.data.data;
  },

  async getDetail(idPd: string): Promise<MahasiswaDetail> {
    const response = await dashboardClient.get(`/data/mahasiswa/${idPd}`);
    return response.data.data;
  },

  async getFilters(params?: { id_fakultas?: string }): Promise<MahasiswaFilters> {
    const response = await dashboardClient.get('/data/mahasiswa/filters', { params });
    return response.data.data;
  },

  getExportUrl(params: MahasiswaListParams): string {
    const base = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
      ? `${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/api/v1`
      : 'http://localhost:9800/dashboard-service/api/v1';
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    return `${base}/data/mahasiswa/export?${q.toString()}`;
  },
};

export default mahasiswaDataService;
