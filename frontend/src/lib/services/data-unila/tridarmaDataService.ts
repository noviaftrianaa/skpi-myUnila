import { dashboardClient } from '@/lib/api/dashboardClient';

export interface LitabmasItem {
  id_litabmas: string; judul: string; jenis: string; tahun: string;
  dana_dikti: number; dana_pt: number; dana_institusi_lain: number; total_dana: number;
  skim: string; lokasi_kegiatan: string;
}
export interface LitabmasStats { total: string; penelitian: string; pengabdian: string; total_dana: string }

export interface PublikasiItem {
  id_publikasi: string; judul: string; nama_jurnal: string; tgl_terbit: string;
  vol: string; no: string; hal: string; doi: string; issn: string; e_issn: string;
  quartile: string; jenis_publikasi: string; tahun: number;
}
export interface PublikasiStats { total: string; ber_quartile: string; ber_doi: string; rentang_tahun: string }

export interface PrestasiItem {
  id_prestasi: string; nama: string; thn_prestasi: string; tahun: string;
  penyelenggara: string; tingkat: string; jenis: string;
}

export interface PrestasiStats {
  total: number; internasional: number; nasional: number; regional: number; lokal: number; tahun_ini: number;
  by_jenis: Array<{ jenis: string; jumlah: number }>;
  by_tahun: Array<{ tahun: number; jumlah: number }>;
}

export interface PengajaranItem {
  id_kls: string;
  nama_kelas: string;
  mata_kuliah: string;
  kode_mk: string | null;
  sks_mk: number | null;
  semester: string;
  prodi: string;
  fakultas: string | null;
  jumlah_dosen: number;
}

export interface PengajaranStats {
  total_kelas: number;
  total_matkul: number;
  total_prodi: number;
  total_dosen: number;
  total_sks: number;
  semester_aktif: string;
}

export const tridarmaDataService = {
  async getLitabmas(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/tridarma/litabmas', { params });
    return r.data.data;
  },
  async getLitabmasStats(): Promise<LitabmasStats> {
    const r = await dashboardClient.get('/data/tridarma/litabmas/stats');
    return r.data.data;
  },
  async getPublikasi(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/tridarma/publikasi', { params });
    return r.data.data;
  },
  async getPublikasiStats(params: Record<string, any> = {}): Promise<PublikasiStats> {
    const r = await dashboardClient.get('/data/tridarma/publikasi/stats', { params });
    return r.data.data;
  },
  async getPrestasi(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/tridarma/prestasi', { params });
    return r.data.data;
  },
  async getPrestasiStats(params: Record<string, any> = {}): Promise<PrestasiStats> {
    const r = await dashboardClient.get('/data/tridarma/prestasi/stats', { params });
    return r.data.data;
  },
  async getPengajaran(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/tridarma/pengajaran', { params });
    return r.data.data;
  },
  async getPengajaranStats(params: Record<string, any> = {}): Promise<PengajaranStats> {
    const r = await dashboardClient.get('/data/tridarma/pengajaran/stats', { params });
    return r.data.data;
  },
};
export default tridarmaDataService;
