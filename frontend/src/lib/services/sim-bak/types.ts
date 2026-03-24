/**
 * TypeScript interfaces untuk SIM-BAK (SIMBAK)
 * Mengikuti schema PostgreSQL simbak_v1.0
 */

// ============ ref schema ============

export interface JenisLayanan {
  id_jenis_layanan: string;
  kode_layanan: string;
  nm_layanan: string;
  kategori: 'surat_mandiri' | 'permohonan_akademik' | 'batch_administrasi' | 'monitoring';
  deskripsi: string | null;
  apakah_aktif: boolean;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface PersyaratanLayanan {
  id_persyaratan: string;
  id_jenis_layanan: string;
  nm_persyaratan: string;
  kode_dokumen: string;
  tipe_file: string;
  ukuran_maks_mb: number;
  apakah_wajib: boolean;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface TahapanLayanan {
  id_tahapan: string;
  id_jenis_layanan: string;
  nm_tahapan: string;
  urutan: number;
  role_penanggung_jawab: string;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateDokumen {
  id_template: string;
  id_jenis_layanan: string;
  nm_template: string;
  jenis_output: string;
  file_path: string | null;
  versi: string;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

// ============ layanan schema ============

export type StatusPengajuan =
  | 'draft'
  | 'diajukan'
  | 'perlu_perbaikan'
  | 'diverifikasi'
  | 'menunggu_persetujuan'
  | 'disetujui'
  | 'ditolak'
  | 'terbit';

export interface Pengajuan {
  id_pengajuan: string;
  id_jenis_layanan: string;
  kode_layanan: string;
  no_pengajuan: string;
  id_pemohon: string;
  status: StatusPengajuan;
  catatan_pemohon: string | null;
  tgl_pengajuan: string | null;
  tgl_selesai: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  nm_layanan?: string;
  nm_pemohon?: string;
  data_pemohon?: DataPemohon;
  dokumen?: DokumenPengajuan[];
  riwayat?: RiwayatPengajuan[];
}

export interface DataPemohon {
  id_data_pemohon: string;
  id_pengajuan: string;
  nm_lengkap: string;
  npm: string | null;
  no_hp: string | null;
  email: string | null;
  id_prodi: string | null;
  nm_prodi: string | null;
  id_fakultas: string | null;
  nm_fakultas: string | null;
  semester: number | null;
  ipk: number | null;
  total_sks: number | null;
  data_tambahan: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DokumenPengajuan {
  id_dokumen: string;
  id_pengajuan: string;
  kode_dokumen: string;
  nm_file: string;
  file_path: string | null;
  tipe_file: string;
  ukuran_byte: number;
  status_verifikasi: 'belum_dicek' | 'valid' | 'tidak_valid';
  catatan_verifikasi: string | null;
  created_at: string;
}

export interface RiwayatPengajuan {
  id_riwayat: string;
  id_pengajuan: string;
  status_dari: string | null;
  status_ke: string;
  catatan: string | null;
  id_aktor: string;
  nm_aktor: string;
  created_at: string;
}

export interface PersetujuanPengajuan {
  id_persetujuan: string;
  id_pengajuan: string;
  urutan: number;
  role_penyetuju: string;
  id_penyetuju: string | null;
  nm_penyetuju: string | null;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  catatan: string | null;
  tgl_respon: string | null;
  created_at: string;
  updated_at: string;
}

export interface DokumenHasil {
  id_dokumen_hasil: string;
  id_pengajuan: string;
  jenis_output: string;
  nm_file: string;
  file_path: string | null;
  tipe_file: string;
  ukuran_byte: number;
  created_at: string;
}

// ============ batch schema ============

export interface BatchPenetapan {
  id_batch: string;
  jenis_sk: 'HABIS_MASA_MUKIM' | 'PUTUS_STUDI';
  no_sk: string | null;
  tgl_sk: string | null;
  periode_akademik: string;
  status: 'draft' | 'verifikasi_fakultas' | 'finalisasi' | 'terbit';
  jumlah_kandidat: number;
  catatan: string | null;
  file_sk_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface KandidatBatch {
  id_kandidat: string;
  id_batch: string;
  id_mahasiswa: string;
  npm: string;
  nm_mahasiswa: string;
  id_prodi: string;
  nm_prodi: string;
  id_fakultas: string;
  nm_fakultas: string;
  semester_terakhir: number | null;
  ipk_terakhir: number | null;
  alasan: string | null;
  status_verifikasi: 'belum_dicek' | 'valid' | 'tidak_valid' | 'dikecualikan';
  catatan_verifikasi: string | null;
  created_at: string;
  updated_at: string;
}

// ============ API Response ============

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// ============ Dashboard ============

export interface DashboardStats {
  total_pengajuan: number;
  pengajuan_baru: number;
  pengajuan_proses: number;
  pengajuan_selesai: number;
  pengajuan_ditolak: number;
  sla_compliance: number;
}
