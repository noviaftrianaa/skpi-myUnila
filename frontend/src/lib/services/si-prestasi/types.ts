/**
 * Types SI-Prestasi — mirror schema postgresql si_prestasi.
 */

export type WorkflowStatus = "draft" | "review" | "ready" | "sending" | "sent" | "error" | "archived";

export interface PesertaMhs {
  id_peserta_mhs?: string;
  nim: string;
  nm_mahasiswa: string;
  nm_prodi?: string | null;
  id_reg_pd_pdut?: string | null;
  id_sms_pdut?: string | null;
}

export interface PesertaDosen {
  id_peserta_dosen?: string;
  nm_dosen: string;
  nuptk?: string | null;
  nidn?: string | null;
  url_surat_tugas: string;
  id_sdm_pdut?: string | null;
}

export interface PrestasiMandiri {
  id_prestasi_mandiri: string;
  kode_pt: string | null;
  thn_prestasi: number;
  id_level_prestasi: string;
  id_kategori_prestasi: string;
  nm_lomba: string;
  nm_cabang: string | null;
  nm_penyelenggara: string;
  id_peringkat: string;
  jumlah_unit_peserta: number;
  id_kelompok_prestasi: string;
  id_bentuk_pelaksanaan: string;
  url_peserta: string | null;
  url_sertifikat: string | null;
  tgl_sertifikat: string;
  url_foto_upp: string | null;
  url_dokumen_undangan: string | null;
  keterangan: string | null;
  status_workflow: WorkflowStatus;
  id_fakultas: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  level_kode?: string;
  level_nama?: string;
  kategori_kode?: string;
  kategori_nama?: string;
  peringkat_kode?: string;
  peringkat_nama?: string;
  kelompok_kode?: string;
  kelompok_nama?: string;
  bentuk_kode?: string;
  bentuk_nama?: string;
  jumlah_peserta_mhs?: number;
  jumlah_peserta_dosen?: number;
  peserta_mhs?: PesertaMhs[];
  peserta_dosen?: PesertaDosen[];
}

export interface Sertifikasi {
  id_sertifikasi: string;
  kode_pt: string | null;
  thn_prestasi: number;
  id_level_prestasi: string;
  nm_sertifikasi: string;
  nm_penyelenggara: string;
  url_peserta: string | null;
  url_sertifikat: string | null;
  tgl_sertifikat: string;
  url_foto_upp: string | null;
  url_dokumen_undangan: string | null;
  keterangan: string | null;
  status_workflow: WorkflowStatus;
  id_fakultas: string | null;
  created_at: string;
  updated_at: string;
  level_kode?: string;
  level_nama?: string;
  jumlah_peserta_mhs?: number;
  jumlah_peserta_dosen?: number;
  peserta_mhs?: PesertaMhs[];
  peserta_dosen?: PesertaDosen[];
}

export interface Rekognisi {
  id_rekognisi: string;
  kode_pt: string | null;
  thn_prestasi: number;
  id_level_prestasi: string;
  id_jenis_rekognisi: string;
  nm_rekognisi: string;
  nm_penyelenggara: string;
  url_peserta: string | null;
  url_sertifikat: string | null;
  tgl_sertifikat: string;
  url_foto_upp: string | null;
  url_dokumen_undangan: string | null;
  keterangan: string | null;
  status_workflow: WorkflowStatus;
  id_fakultas: string | null;
  created_at: string;
  updated_at: string;
  level_kode?: string;
  level_nama?: string;
  jenis_kode?: string;
  jenis_nama?: string;
  jumlah_peserta_mhs?: number;
  jumlah_peserta_dosen?: number;
  peserta_mhs?: PesertaMhs[];
  peserta_dosen?: PesertaDosen[];
}

export interface RefLevel { id_level_prestasi: string; kode_simkatmawa: string; nm_level: string; urutan: number; a_active: boolean }
export interface RefKategori { id_kategori_prestasi: string; kode_simkatmawa: string; nm_kategori: string; urutan: number }
export interface RefPeringkat { id_peringkat: string; kode_simkatmawa: string; nm_peringkat: string; urutan: number }
export interface RefKelompok { id_kelompok_prestasi: string; kode_simkatmawa: string; nm_kelompok: string; urutan: number }
export interface RefBentuk { id_bentuk_pelaksanaan: string; kode_simkatmawa: string; nm_bentuk: string; urutan: number }
export interface RefJenisRekognisi { id_jenis_rekognisi: string; kode_simkatmawa: string; nm_jenis: string; urutan: number; a_active: boolean }

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface MahasiswaLookup {
  nim: string;
  nama: string;
  prodi: string;
  fakultas?: string;
  id_reg_pd?: string;
  id_sms?: string;
}

export interface DosenLookup {
  nuptk: string | null;
  nidn: string | null;
  nama: string;
  id_sdm?: string;
  unit?: string;
}

export interface FileUploadResponse {
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  path: string;
  url: string;
  jenis: string;
  parent_tipe: string;
  id_parent: string;
}
