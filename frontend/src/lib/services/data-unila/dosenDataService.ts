import { dashboardClient } from '@/lib/api/dashboardClient';

export interface DosenItem {
  id_sdm: string; nm_sdm: string; jk: string; nidn: string; nip: string; nik: string;
  tgl_lahir: string; tmpt_lahir: string; email: string; no_hp: string;
  id_sms: string; nm_prodi: string; nm_fakultas: string; id_fakultas: string;
  nm_agama: string; jabatan_fungsional: string; status: string; jenis_sdm: string;
}

export interface DosenDetail {
  biodata: DosenItem & { npwp: string; jln: string; ds_kel: string; kode_pos: string };
  riwayat_fungsional: Array<{ nm_jabfung: string; sk_jabfung: string; tmt_sk_jabfung: string; angka_kredit: string }>;
  riwayat_pendidikan: Array<{ institusi: string; gelar: string; bidang_studi: string; thn_lulus: string; jenjang: string }>;
  sertifikasi: Array<{ no_sert: string; thn_sert: number; nrg: string; bidang_studi: string }>;
}

export interface DosenStats { total: string; aktif: string; dosen: string; tendik: string; ber_nidn: string }

export interface JabfungItem {
  id_rwy_jabfung: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  nm_jabfung: string;
  sk_jabfung: string;
  tmt_sk_jabfung: string;
  angka_kredit: string;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
}

export interface JabfungStats {
  total: string;
  total_dosen: string;
  total_jenis: string;
  guru_besar: string;
  lektor_kepala: string;
  lektor: string;
  asisten: string;
}

export interface SertifikasiItem {
  id_rwy_sert: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  no_sert: string;
  tahun: number;
  nrg: string;
  bidang_studi: string;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
}

export interface SertifikasiStats {
  total: string;
  total_dosen: string;
  total_jenis: string;
  total_tahun: string;
}

export const dosenDataService = {
  async getList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen', { params });
    return r.data.data;
  },
  async getStats(params: Record<string, any>): Promise<DosenStats> {
    const r = await dashboardClient.get('/data/dosen/stats', { params });
    return r.data.data;
  },
  async getDetail(id: string): Promise<DosenDetail> {
    const r = await dashboardClient.get(`/data/dosen/${id}`);
    return r.data.data;
  },
  getExportUrl(params: Record<string, any>): string {
    const base = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
      ? `${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/api/v1` : 'http://localhost:9800/dashboard-service/api/v1';
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    return `${base}/data/dosen/export?${q.toString()}`;
  },

  async getJabfungList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/jabfung', { params });
    return r.data.data;
  },
  async getJabfungStats(params: Record<string, any> = {}): Promise<JabfungStats> {
    const r = await dashboardClient.get('/data/dosen/jabfung/stats', { params });
    return r.data.data;
  },

  async getSertifikasiList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/sertifikasi', { params });
    return r.data.data;
  },
  async getSertifikasiStats(params: Record<string, any> = {}): Promise<SertifikasiStats> {
    const r = await dashboardClient.get('/data/dosen/sertifikasi/stats', { params });
    return r.data.data;
  },
};
export default dosenDataService;
