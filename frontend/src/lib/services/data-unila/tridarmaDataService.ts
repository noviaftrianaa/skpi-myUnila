import { dashboardClient } from '@/lib/api/dashboardClient';

export interface LitabmasItem {
  id_litabmas: string; judul: string; jenis: string; tahun: string;
  dana_dikti: number; dana_pt: number; dana_institusi_lain: number; total_dana: number;
  skim: string; lokasi_kegiatan: string;
}
export interface LitabmasStats { total: string; penelitian: string; pengabdian: string; total_dana: string }

export interface LitabmasAnggotaMeta {
  id_litabmas: string; judul: string; jenis: string; tahun: string; skim: string | null;
}
export interface LitabmasAnggotaDosen {
  id_sdm: string; nama: string; nidn: string | null; nip: string | null;
  peran: string; peran_code: string; aktif: number;
}
export interface LitabmasAnggotaMahasiswa {
  id_pd_ang_litabmas: string; id_pd: string; nama: string | null; nipd: string | null;
  peran: string; peran_code: string; aktif: number; prodi: string | null; id_jenj: number | null;
}
export interface LitabmasAnggotaResponse {
  meta: LitabmasAnggotaMeta | null;
  dosen: LitabmasAnggotaDosen[];
  mahasiswa: LitabmasAnggotaMahasiswa[];
  mahasiswa_total: number;
  mahasiswa_limit: number;
  mahasiswa_offset: number;
}

export interface PublikasiItem {
  id_publikasi: string; judul: string; nama_jurnal: string; tgl_terbit: string;
  vol: string; no: string; hal: string; doi: string; issn: string; e_issn: string;
  quartile: string; jenis_publikasi: string; tahun: number;
}
export interface PublikasiStats { total: string; ber_quartile: string; ber_doi: string; rentang_tahun: string }

export interface PublikasiPenulisItem {
  id_tulis_pub: string;
  id_sdm: string;
  nama: string;
  nidn: string;
  nipd: string;
  urutan: number;
  peran_tulis: string;
  peran_label: string;
  afiliasi: string;
  is_corresponding: number;
  jns_penulis: number;
}

export interface PublikasiPenulisResponse {
  meta: {
    id_publikasi: string;
    judul: string;
    nama_jurnal: string;
    tgl_terbit: string | null;
    vol: string; no: string; hal: string;
    doi: string; quartile: string;
    tahun: number | null;
    jenis_publikasi: string;
  } | null;
  penulis: PublikasiPenulisItem[];
}

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
  dosen_pengampu: string | null;
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
  async getLitabmasStats(params: Record<string, any> = {}): Promise<LitabmasStats & { by_skim?: Array<{ skim: string; jumlah: number }> }> {
    const r = await dashboardClient.get('/data/tridarma/litabmas/stats', { params });
    return r.data.data;
  },
  async getLitabmasAnggota(idLitabmas: string, params: { limit?: number; offset?: number } = {}): Promise<LitabmasAnggotaResponse> {
    const r = await dashboardClient.get(`/data/tridarma/litabmas/${idLitabmas}/anggota`, { params });
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
  async getPublikasiPenulis(id: string): Promise<PublikasiPenulisResponse> {
    const r = await dashboardClient.get(`/data/tridarma/publikasi/${id}/penulis`);
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
