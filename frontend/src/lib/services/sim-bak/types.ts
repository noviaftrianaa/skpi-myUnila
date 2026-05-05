/**
 * TypeScript interfaces untuk SIM-BAK (SIMBAK)
 * Synced with actual PostgreSQL schema simbak (2026-03-28)
 */

// ============ ref schema ============

export interface JenisLayanan {
  id_jenis_layanan: string;
  kode_layanan: string;
  nm_layanan: string;
  deskripsi: string | null;
  kategori: 'surat_mandiri' | 'permohonan_akademik' | 'batch_administrasi' | 'monitoring';
  a_aktif: boolean;
  a_batch: boolean;
  urutan: number;
  sla_hari: number | null;
  created_at: string;
  updated_at: string;
}

export interface PersyaratanLayanan {
  id_persyaratan: string;
  id_jenis_layanan: string;
  kode_dokumen: string;
  nm_dokumen: string;
  deskripsi: string | null;
  a_wajib: boolean;
  urutan: number;
  tipe_file: string;
  max_size_mb: number;
  created_at: string;
  updated_at: string;
  // joined
  nm_layanan?: string;
  kode_layanan?: string;
}

export interface TahapanLayanan {
  id_tahapan: string;
  id_jenis_layanan: string;
  urutan: number;
  nm_tahapan: string;
  kode_role: string;
  status_masuk: string;
  status_selesai: string;
  a_opsional: boolean;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_layanan?: string;
  kode_layanan?: string;
}

export interface TemplateDokumen {
  id_template: string;
  id_jenis_layanan: string;
  nm_template: string;
  versi: string;
  path_file: string;
  tipe_file: string;
  a_aktif: boolean;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_layanan?: string;
  kode_layanan?: string;
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
  nomor_permohonan: string;
  id_pemohon: string;
  status: StatusPengajuan;
  alasan: string | null;
  catatan_pemohon: string | null;
  id_smt_mulai_cuti: string | null;
  jumlah_semester_cuti: number | null;
  id_prodi_tujuan: string | null;
  id_fakultas_tujuan: string | null;
  tgl_diajukan: string | null;
  tgl_selesai: string | null;
  nomor_dokumen_hasil: string | null;
  tgl_dokumen_hasil: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  kode_layanan?: string;
  nm_layanan?: string;
  kategori?: string;
  sla_hari?: number;
  nm_mahasiswa?: string;
  nim?: string;
  nm_prodi?: string;
  nm_fakultas?: string;
  semester_aktif?: number;
  ipk?: number;
  // nested (from detail endpoint)
  data_pemohon?: DataPemohon;
  dokumen?: DokumenPengajuan[];
  riwayat?: RiwayatPengajuan[];
  persetujuan?: PersetujuanPengajuan[];
  dokumen_hasil?: DokumenHasil[];
}

export interface DataPemohon {
  id_data_pemohon: string;
  id_pengajuan: string;
  id_mahasiswa: string;
  nim: string;
  nm_mahasiswa: string;
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  jenis_kelamin: string | null;
  id_fakultas: string | null;
  nm_fakultas: string | null;
  id_prodi: string | null;
  nm_prodi: string | null;
  nm_jenjang: string | null;
  angkatan: number | null;
  semester_aktif: number | null;
  id_smt: string | null;
  ipk: number | null;
  sks_lulus: number | null;
  masa_studi_semester: number | null;
  status_mahasiswa: string | null;
  status_registrasi: string | null;
  status_pembayaran: string | null;
  tgl_snapshot: string;
}

export interface DokumenPengajuan {
  id_dokumen: string;
  id_pengajuan: string;
  id_persyaratan: string | null;
  nm_dokumen: string;
  nama_file_asli: string;
  path_file: string;
  tipe_file: string;
  ukuran_byte: number;
  id_pengunggah: string;
  keterangan: string | null;
  tgl_upload: string;
  created_at: string;
}

export interface RiwayatPengajuan {
  id_riwayat: string;
  id_pengajuan: string;
  id_tahapan: string | null;
  urutan: number;
  nm_tahapan: string;
  status_dari: string;
  status_ke: string;
  id_aktor: string | null;
  nm_aktor: string | null;
  kode_role_aktor: string | null;
  catatan: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  created_at: string;
  // joined
  nomor_permohonan?: string;
  nm_layanan?: string;
}

export interface PersetujuanPengajuan {
  id_persetujuan: string;
  id_pengajuan: string;
  id_riwayat: string | null;
  id_approver: string;
  nm_approver: string | null;
  kode_role_approver: string;
  keputusan: 'disetujui' | 'ditolak';
  catatan: string | null;
  tgl_keputusan: string;
  a_diterima_tujuan: boolean | null;
  hasil_wawancara: string | null;
  daftar_konversi_sks: string | null;
  created_at: string;
  // timeline fields
  urutan?: number;
  status?: string;
  role_penyetuju?: string;
  nm_penyetuju?: string | null;
  tgl_respon?: string | null;
}

export interface DokumenHasil {
  id_dokumen_hasil: string;
  id_pengajuan: string;
  id_template: string | null;
  jenis_output: string;
  nomor_dokumen: string | null;
  tgl_dokumen: string | null;
  nm_dokumen: string;
  path_file: string;
  tipe_file: string;
  ukuran_byte: number | null;
  id_penerbit: string;
  a_final: boolean;
  keterangan: string | null;
  created_at: string;
}

// ============ batch schema ============

export interface BatchPenetapan {
  id_batch_penetapan: string;
  id_jenis_layanan: string;
  kode_batch: string;
  nm_batch: string;
  jenis_batch: 'habis_masa_mukim' | 'putus_studi';
  id_smt: string;
  status: 'draft' | 'kandidat_ditarik' | 'verifikasi_fakultas' | 'sk_dekan_terbit' | 'finalisasi' | 'terbit';
  id_pembuat: string;
  kriteria_snapshot: string;
  jumlah_kandidat: number;
  jumlah_terverifikasi: number;
  jumlah_dikeluarkan: number;
  nomor_sk_dekan: string | null;
  tgl_sk_dekan: string | null;
  path_sk_dekan: string | null;
  nomor_sk_rektor: string | null;
  tgl_sk_rektor: string | null;
  path_sk_rektor: string | null;
  tgl_tarik_data: string | null;
  tgl_selesai: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  kode_layanan?: string;
  nm_layanan?: string;
}

export interface KandidatBatch {
  id_kandidat: string;
  id_batch_penetapan: string;
  id_mahasiswa: string;
  nim: string;
  nm_mahasiswa: string;
  id_fakultas: string | null;
  nm_fakultas: string | null;
  id_prodi: string | null;
  nm_prodi: string | null;
  nm_jenjang: string | null;
  angkatan: number | null;
  semester_aktif: number | null;
  ipk: number | null;
  sks_lulus: number | null;
  masa_studi_semester: number | null;
  status_mahasiswa: string | null;
  status_kandidat: 'masuk' | 'terverifikasi' | 'dikeluarkan';
  alasan_exclusion: string | null;
  // joined verifikasi
  id_verifikasi?: string;
  hasil_verifikasi?: string;
  catatan_verifikasi?: string;
  nm_verifikator?: string;
  tgl_verifikasi?: string;
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
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// ============ Dashboard ============

export interface DashboardStats {
  total_pengajuan: number;
  pengajuan_baru: number;
  pengajuan_proses: number;
  pengajuan_selesai: number;
  pengajuan_ditolak: number;
  pengajuan_perbaikan?: number;
  // mahasiswa view
  total?: number;
  draft?: number;
  proses?: number;
  selesai?: number;
  ditolak?: number;
  perbaikan?: number;
}
