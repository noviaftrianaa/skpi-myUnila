import { dashboardClient } from '@/lib/api/dashboardClient';

export interface ProdiStats {
  total: number;
  sarjana: number;
  profesi: number;
  magister: number;
  doktor: number;
  diploma: number;
  spesialis: number;
  unggul: number;
  akreditasi_breakdown: Array<{ peringkat: string; jumlah: number }>;
}

export interface AkreditasiStats {
  total: number;
  aktif: number;
  expired: number;
  akan_expire: number;
  unggul: number;
  baik_sekali: number;
  baik: number;
  by_lembaga: Array<{ lembaga: string; jumlah: number }>;
}

export interface MatkulStats {
  total: number;
  dgn_praktikum: number;
  teori_only: number;
  total_sks: number;
  rata_sks: number;
  by_jenis: Array<{ jenis: string; jumlah: number }>;
}

export interface ProdiDetailInfo {
  id_sms: string;
  nm_prodi: string;
  jenjang: string;
  id_fakultas: string;
  nm_fakultas: string;
  stat_prodi: string;
  akreditasi_terkini: {
    peringkat: string;
    tgl_sk: string | null;
    tgl_expired: string | null;
    lembaga: string;
  } | null;
}

export interface ProdiAkreditasiHistoryItem {
  id: string;
  peringkat: string;
  tgl_sk: string | null;
  tgl_expired: string | null;
  lembaga: string;
  no_sk: string | null;
  a_aktif: number;
}

export interface ProdiDosenHomebaseItem {
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  jabatan_fungsional: string;
  status: string;
}

export interface ProdiKurikulumAktif {
  id: string;
  nama: string;
  smt_berlaku: string | null;
  total_sks: number;
}

export interface ProdiDetail {
  info: ProdiDetailInfo;
  akreditasi_history: ProdiAkreditasiHistoryItem[];
  dosen_homebase: { total: number; list: ProdiDosenHomebaseItem[] };
  mahasiswa_aktif: number;
  matkul_count: number;
  kurikulum_aktif: ProdiKurikulumAktif | null;
}

export const akademikDataService = {
  async getProdi(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/prodi', { params: p })).data.data; },
  async getProdiStats(p: Record<string, any> = {}): Promise<ProdiStats> { return (await dashboardClient.get('/data/akademik/prodi/stats', { params: p })).data.data; },
  async getProdiDetail(id: string): Promise<ProdiDetail> { return (await dashboardClient.get(`/data/akademik/prodi/${encodeURIComponent(id)}`)).data.data; },
  async getAkreditasi(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/akreditasi', { params: p })).data.data; },
  async getAkreditasiStats(p: Record<string, any> = {}): Promise<AkreditasiStats> { return (await dashboardClient.get('/data/akademik/akreditasi/stats', { params: p })).data.data; },
  async getMatkul(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/matkul', { params: p })).data.data; },
  async getMatkulStats(p: Record<string, any> = {}): Promise<MatkulStats> { return (await dashboardClient.get('/data/akademik/matkul/stats', { params: p })).data.data; },
  async getKurikulum(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/kurikulum', { params: p })).data.data; },
  async getKurikulumStats(p: Record<string, any> = {}): Promise<KurikulumStats> { return (await dashboardClient.get('/data/akademik/kurikulum/stats', { params: p })).data.data; },
};

export interface KurikulumItem {
  id_kurikulum_sp: string;
  id_sms: string;
  nm_kurikulum: string;
  jenjang: string;
  id_smt: string;
  tahun_mulai: string;
  jmlh_smt_normal: number;
  sks_lulus: string | number;
  sks_wajib: string | number;
  sks_pilihan: string | number;
  a_digunakan: number;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  jml_matkul: number | string;
}
export interface KurikulumStats {
  total: number | string;
  aktif: number | string;
  total_prodi: number | string;
  avg_sks: number | string;
}
export default akademikDataService;
