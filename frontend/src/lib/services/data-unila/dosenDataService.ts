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
  sertifikasi: Array<{ nm_sert: string; no_sert: string; tgl_sert: string; bidang_studi: string }>;
}

export interface DosenStats { total: string; aktif: string; dosen: string; tendik: string; ber_nidn: string }

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
};
export default dosenDataService;
