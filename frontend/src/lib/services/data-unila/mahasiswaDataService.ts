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
  id_jurusan?: string | null;
  nm_jurusan?: string | null;
  angkatan: string;
  id_semester_masuk: string;
  jalur_masuk: string | null;
  semester: number | null;
  ipk: string | null;
  status: string;
  tgl_keluar: string | null;
  nm_agama: string;
  email: string;
  tlpn_hp: string;
}

export interface MahasiswaProfileSiakadu {
  nim: string; nama: string; gelar_depan?: string; gelar_belakang?: string;
  jk?: string; tmpt_lahir?: string; tgl_lahir?: string; status_nikah?: string;
  nik?: string; nokk?: string; nisn?: string; nupn?: string;
  alamat?: string; kode_pos?: string; nama_kota?: string; kecamatan?: string;
  dusun?: string; desa?: string; rt?: string | number; rw?: string | number;
  telepon?: string; hp?: string; hp2?: string;
  email?: string; email_kampus?: string; email_ortu?: string;
  nm_fakultas?: string; nm_jurusan?: string; nm_prodi?: string; nm_bidang_studi?: string;
  semester?: number; ipk?: string; sks_total?: number; sks_lulus?: number;
  status_mahasiswa?: string; nama_kelas?: string; periode_terakhir?: string;
  jalur_pendaftaran?: string; gelombang?: string; tgl_daftar?: string;
  nilai_tpa?: number; nilai_kesehatan?: number; nilai_psikotes?: number; nilai_wawancara?: number;
  is_beasiswa?: number; is_transfer?: number; jenis_transfer?: string; tgl_transfer?: string;
  nim_lama?: string; univ_asal?: string; ipk_asal?: string; sks_asal?: number;
  prodi_asal?: string; instansi?: string;
  asal_smu?: string; alamat_smu?: string; telp_smu?: string; no_ijazah_smu?: string;
  jurusan_sekolah?: string; nem?: string; thn_lulus_sekolah?: string;
  nama_agama?: string; gol_darah?: string; berat_badan?: number; tinggi_badan?: number;
  nama_hobi?: string; nama_minat?: string; nama_suku?: string; nama_negara?: string;
  jenis_tinggal?: string; nama_transport?: string;
  nama_pekerjaan?: string; nama_penghasilan?: string;
  kategori_ukt?: string;
  last_sync?: string;
}

export interface MahasiswaProfilePddikti {
  nim: string; nama: string; jk?: string;
  tmpt_lahir?: string; tgl_lahir?: string;
  nik?: string; nisn?: string; email?: string;
  hp?: string; telepon?: string;
  alamat?: string; rt?: string | number; rw?: string | number;
  dusun?: string; desa_kelurahan?: string; kode_pos?: string;
  nokk?: string;
  nm_ayah?: string; nm_ibu?: string; nm_wali?: string;
  tgl_lahir_ayah?: string; tgl_lahir_ibu?: string;
  nik_ayah?: string; nik_ibu?: string;
  nama_agama?: string; nama_wilayah?: string;
  nm_prodi?: string; nm_jurusan?: string; nm_fakultas?: string;
  semester_masuk?: string; angkatan?: string;
  jalur_masuk?: string; jenis_pendaftaran?: string;
  ipk?: string | null; sks_total?: number | string | null; semester?: number | string;
  status?: string;
  tgl_keluar?: string | null; last_sync?: string;
}

export interface KeluargaItem {
  status_keluarga: string; nama: string; nik?: string;
  tgl_lahir?: string; pekerjaan?: string; penghasilan?: string;
  alamat?: string; no_hp?: string; pendidikan_terakhir?: string;
}

export interface RiwayatSemester {
  id_smt: string; semester?: string;
  ips?: string | null; ipk?: string | null;
  sks_semester?: number; total_sks?: number; status?: string;
}

export interface MahasiswaFullProfile {
  siakadu: MahasiswaProfileSiakadu | null;
  pddikti: MahasiswaProfilePddikti | null;
  keluarga: KeluargaItem[];
  riwayat_semester: RiwayatSemester[];
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
  keluar?: string;
  mutasi?: string;
  total_prodi: string;
  total_fakultas: string;
  gender_l?: string;
  gender_p?: string;
  avg_ipk?: string | null;
  jenj_diploma?: string;
  jenj_s1?: string;
  jenj_profesi?: string;
  jenj_spesialis?: string;
  jenj_s2?: string;
  jenj_s3?: string;
  last_sync?: string | null;
  data_source?: string;
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
  prodi: Array<{ id_sms: string; id_fakultas?: string; id_jurusan?: string; nm_prodi: string; jenjang: string }>;
  jurusan?: Array<{ id_jurusan: string; id_fakultas?: string; nm_jurusan: string }>;
  jalur_daftar?: Array<{ id_jalur_daftar: string; nm_jalur_daftar: string }>;
  jenis_keluar?: Array<{ id_jns_keluar: string; nm_jns_keluar: string }>;
  tahun_lulus?: Array<{ tahun_lulus: string | number }>;
}

export interface MahasiswaListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  id_fakultas?: string;
  id_prodi?: string;
  id_jurusan?: string;
  id_jalur_daftar?: string;
  angkatan?: string;
  semester?: string;
  status?: string;
  tahun_lulus?: string;
  ipk_min?: string;
  ipk_max?: string;
  unit_filter?: string;
}

export interface LulusanItem {
  id_pd: string;
  id_reg_pd: string;
  nipd: string;
  nm_pd: string;
  jk: string;
  nm_prodi: string;
  jenjang: string;
  nm_fakultas: string;
  id_fakultas: string;
  id_sms: string;
  angkatan: string;
  jalur_masuk: string | null;
  tgl_masuk: string | null;
  tgl_lulus: string | null;
  lama_studi_bulan: number | null;
  tepat_waktu: number;
  sk_yudisium: string | null;
  tgl_sk_yudisium: string | null;
  no_seri_ijazah: string | null;
  ipk: string | null;
  email: string;
  tlpn_hp: string;
}

export interface LulusanStats {
  total: string;
  avg_ipk: string | null;
  total_prodi: string;
  total_fakultas: string;
  total_angkatan: string;
  gender_l?: string;
  gender_p?: string;
  cumlaude?: string;
  sangat_memuaskan?: string;
  memuaskan?: string;
  tepat_waktu?: string;
  avg_lama_studi_bulan?: string | null;
  jenj_diploma?: string;
  jenj_s1?: string;
  jenj_profesi?: string;
  jenj_spesialis?: string;
  jenj_s2?: string;
  jenj_s3?: string;
  last_sync?: string | null;
  data_source?: string;
}

export interface AktivitasItem {
  id_akt_mhs: string;
  judul: string;
  id_jns_akt_mhs: number;
  jenis_aktivitas: string;
  lokasi_kegiatan: string;
  tgl_selesai: string | null;
  id_smt: string;
  nm_smt: string | null;
  tahun: number | null;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
  daftar_anggota: string | null;
  a_komunal: number;
}

export interface AktivitasStats {
  total: string;
  total_prodi: string;
  total_fakultas?: string;
  total_semester: string;
  akademik: string;
  non_akademik: string;
  kkn?: string;
  pkl?: string;
  mbkm?: string;
  penelitian?: string;
  pengabdian?: string;
  kompetisi?: string;
  organisasi?: string;
  by_jenis?: Array<{ id_jns_akt_mhs: number; nama_jenis: string; jumlah: number | string }>;
  last_sync?: string | null;
  data_source?: string;
}

export interface AktivitasFilters {
  tahun: Array<{ tahun: number | string }>;
  jenis: Array<{ id_jns_akt_mhs: number; nama_jenis: string }>;
}

export const mahasiswaDataService = {
  async getList(params: MahasiswaListParams): Promise<MahasiswaListResult> {
    const response = await dashboardClient.get('/data/mahasiswa', { params });
    return response.data.data;
  },

  async getStats(params: Omit<MahasiswaListParams, 'page' | 'limit' | 'sort_by' | 'sort_order'> | Record<string, string>): Promise<MahasiswaStats> {
    const response = await dashboardClient.get('/data/mahasiswa/stats', { params });
    return response.data.data;
  },

  async getDetail(idPd: string): Promise<MahasiswaDetail> {
    const response = await dashboardClient.get(`/data/mahasiswa/${idPd}`);
    return response.data.data;
  },

  async getFullProfile(idPd: string): Promise<MahasiswaFullProfile> {
    const response = await dashboardClient.get(`/data/mahasiswa/${idPd}/profile`);
    return response.data.data;
  },

  async resolveByNim(nim: string): Promise<string | null> {
    const r = await dashboardClient.get('/data/mahasiswa/resolve-nim', { params: { nim } });
    return r.data?.data?.id_pd ?? null;
  },

  async getFilters(params?: { id_fakultas?: string; id_jurusan?: string }): Promise<MahasiswaFilters> {
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

  async getLulusan(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/mahasiswa/lulusan', { params });
    return r.data.data;
  },
  async getLulusanStats(params: Record<string, any> = {}): Promise<LulusanStats> {
    const r = await dashboardClient.get('/data/mahasiswa/lulusan/stats', { params });
    return r.data.data;
  },

  async getAktivitas(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/mahasiswa/aktivitas', { params });
    return r.data.data;
  },
  async getAktivitasStats(params: Record<string, any> = {}): Promise<AktivitasStats> {
    const r = await dashboardClient.get('/data/mahasiswa/aktivitas/stats', { params });
    return r.data.data;
  },
  async getAktivitasFilters(): Promise<AktivitasFilters> {
    const r = await dashboardClient.get('/data/mahasiswa/aktivitas/filters');
    return r.data.data;
  },

  async getUjian(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/mahasiswa/ujian', { params });
    return r.data.data;
  },
  async getUjianStats(params: Record<string, any> = {}): Promise<UjianStats> {
    const r = await dashboardClient.get('/data/mahasiswa/ujian/stats', { params });
    return r.data.data;
  },
};

export interface UjianItem {
  id_uji_mhs: string;
  id_sdm: string;
  nm_sdm: string;
  nidn: string | null;
  nip: string | null;
  urutan_uji: number;
  peran_uji: string;
  id_akt_mhs: string;
  judul_ujian: string;
  jenis_ujian: string;
  tgl_selesai: string | null;
  id_smt: string;
  tahun: string;
  nm_mahasiswa: string | null;
  nipd_mahasiswa: string | null;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
}
export interface UjianStats {
  total: number | string;
  total_dosen: number | string;
  total_ujian: number | string;
  total_jenis: number | string;
  by_jenis: Array<{ jenis: string; jumlah: number }>;
}

export default mahasiswaDataService;
