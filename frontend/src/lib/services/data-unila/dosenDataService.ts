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
  riwayat_kepangkatan?: Array<{ golongan: string; pangkat: string; sk_pangkat: string; tgl_sk_pangkat: string; tmt_sk_pangkat: string; masa_kerja_gol_thn: number; masa_kerja_gol_bln: number }>;
  tugas_tambahan?: Array<{ jabatan_tambahan: string; sk_tugas: string; tmt_mulai: string; tmt_selesai: string | null; jml_jam: number | null; unit: string | null }>;
  riwayat_diklat?: Array<{ jenis: string | null; nama_diklat: string | null; tempat: string | null; tgl_mulai: string | null; tgl_selesai: string | null; jml_jam: number | null; no_sert: string | null }>;
  riwayat_pekerjaan?: Array<{ jabatan: string | null; instansi: string | null; divisi: string | null; deskripsi_kerja: string | null; luar_negeri: number | boolean | null; mulai_bekerja: string | null; selesai_bekerja: string | null; jenis_pekerjaan: string | null }>;
}

export interface DosenStats {
  total: string;
  aktif: string;
  dosen: string;
  tendik: string;
  ber_nidn: string;
  ber_nip?: string;
  gender_l?: string;
  gender_p?: string;
  total_fakultas?: number | string;
  by_jabfung?: Array<{ nm_jabfung: string; jumlah: number | string }>;
  by_pendidikan?: Array<{ jenjang: string | null; jumlah: number | string }>;
  last_sync?: string | null;
  data_source?: string;
}

export interface JabfungItem {
  id_rwy_jabfung: string;
  id_sdm: string;
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
  status_dosen?: string;
}

export interface JabfungStats {
  total: string;
  total_dosen: string;
  total_jenis: string;
  guru_besar: string;
  lektor_kepala: string;
  lektor: string;
  asisten: string;
  by_jabfung?: Array<{ nm_jabfung: string; jumlah: number | string }>;
}

export interface SertifikasiItem {
  id_rwy_sert: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  no_sert: string;
  tahun: number;
  nrg: string;
  bidang_studi: string;
  jenis_sertifikasi?: string;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  status_dosen?: string;
}

export interface PendidikanItem {
  id_rwy_pendidikan: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  jenjang: string;
  gelar: string;
  bidang_studi: string;
  institusi: string;
  fakultas_asal: string;
  thn_lulus: number | null;
  thn_masuk: number | null;
  ipk: string | null;
  no_ijazah: string | null;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  status_dosen?: string;
}

export interface PendidikanStats {
  total: string;
  total_dosen: string;
  total_jenjang: string;
  tahun_min?: number | string;
  tahun_max?: number | string;
  by_jenjang?: Array<{ nm_jenjang: string; jumlah: number | string }>;
}

export interface KepangkatanItem {
  id_rwy_pangkat: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  golongan: string;
  pangkat: string;
  sk_pangkat: string;
  tgl_sk_pangkat: string | null;
  tmt_sk_pangkat: string | null;
  masa_kerja_gol_thn: number | null;
  masa_kerja_gol_bln: number | null;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  status_dosen?: string;
}

export interface KepangkatanStats {
  total: string;
  total_dosen: string;
  total_golongan: string;
  tmt_min?: string;
  tmt_max?: string;
  by_golongan?: Array<{ kode_gol: string; nm_pangkat: string; jumlah: number | string }>;
}

export interface TugasTambahanItem {
  id_tgs_tambah: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  jabatan_tambahan: string;
  no_sk: string;
  tmt_mulai: string | null;
  tmt_selesai: string | null;
  jml_jam: number | null;
  unit_tugas: string | null;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  status_dosen?: string;
}

export interface TugasTambahanStats {
  total: string;
  total_dosen: string;
  total_jabatan: string;
  aktif: string;
  by_jabatan?: Array<{ nm_jabatan: string; jumlah: number | string }>;
}

export interface BimbinganItem {
  id_bimb_mhs: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string;
  nip: string;
  id_akt_mhs: string;
  judul_bimbingan: string;
  jenis_aktivitas: string | null;
  urutan_promotor: number | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  nm_mahasiswa: string | null;
  nipd_mahasiswa: string | null;
  nm_prodi: string | null;
  nm_fakultas: string | null;
  id_fakultas: string | null;
}

export interface BimbinganStats {
  total: string;
  total_dosen: string;
  total_aktivitas: string;
  total_jenis: string;
  by_jenis_aktivitas?: Array<{ jenis_aktivitas: string; jumlah: number | string }>;
}

export interface SertifikasiStats {
  total: string;
  total_dosen: string;
  total_jenis: string;
  total_tahun: string;
  tahun_min?: number | string;
  tahun_max?: number | string;
  by_jenis_sertifikasi?: Array<{ nm_jenis_sertifikasi: string; jumlah: number | string }>;
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

  async getPendidikanList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/pendidikan', { params });
    return r.data.data;
  },
  async getPendidikanStats(params: Record<string, any> = {}): Promise<PendidikanStats> {
    const r = await dashboardClient.get('/data/dosen/pendidikan/stats', { params });
    return r.data.data;
  },

  async getKepangkatanList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/kepangkatan', { params });
    return r.data.data;
  },
  async getKepangkatanStats(params: Record<string, any> = {}): Promise<KepangkatanStats> {
    const r = await dashboardClient.get('/data/dosen/kepangkatan/stats', { params });
    return r.data.data;
  },

  async getTugasTambahanList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/tugas-tambahan', { params });
    return r.data.data;
  },
  async getTugasTambahanStats(params: Record<string, any> = {}): Promise<TugasTambahanStats> {
    const r = await dashboardClient.get('/data/dosen/tugas-tambahan/stats', { params });
    return r.data.data;
  },

  async getBimbinganList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/dosen/bimbingan', { params });
    return r.data.data;
  },
  async getBimbinganStats(params: Record<string, any> = {}): Promise<BimbinganStats> {
    const r = await dashboardClient.get('/data/dosen/bimbingan/stats', { params });
    return r.data.data;
  },
};
export default dosenDataService;
