/**
 * Feeder Service Types
 * Types for Aktivitas Mahasiswa and related entities
 */

// ============================================================================
// Aktivitas Mahasiswa Types
// ============================================================================

export interface AktivitasMahasiswa {
  id_akt_mhs: string;
  id_jns_akt_mhs?: number;
  id_sms?: string;
  id_smt?: string;
  judul_akt_mhs?: string;
  lokasi_kegiatan?: string;
  sk_tugas?: string;
  tgl_sk_tugas?: string;
  ket_akt?: string;
  a_komunal?: number;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string;
  soft_delete: number;
  last_sync: string;
}

export interface AnggotaAktivitas {
  id_ang_akt_mhs: string;
  id_akt_mhs: string;
  id_reg_pd?: string;
  nm_pd?: string;
  nipd?: string;
  jns_peran_mhs?: number;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string;
  soft_delete: number;
  last_sync: string;
}

// List view types
export interface AktivitasListItem {
  id_akt_mhs: string;
  judul_akt_mhs?: string;
  nama_jenis_aktivitas?: string;
  id_semester?: string;
  angkatan?: string;
  lokasi_kegiatan?: string;
  sk_tugas?: string;
  tgl_sk_tugas?: string;
  a_komunal?: number;
  jumlah_anggota?: number;
  last_sync?: string;
  id_prodi?: string;
  nama_prodi?: string;
  nama_jenjang?: string;
}

export interface AktivitasListResult {
  data: AktivitasListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Detail view types
export interface AktivitasDetail {
  aktivitas: AktivitasMahasiswa;
  anggota: AnggotaAktivitas[];
}

// Sync types
export interface AktivitasSyncResult {
  id_aktivitas: string;
  judul: string;
  jumlah_anggota: number;
  success: boolean;
  error?: string;
}

export interface SyncFilter {
  id_semester: string[]; // MANDATORY - minimum 1
  id_prodi?: string;
  force_sync?: boolean;
}

export interface BatchAktivitasSyncResult {
  total_processed: number;
  total_success: number;
  total_failed: number;
  duration: string;
  results?: AktivitasSyncResult[];
  synced_by: string;
  filter?: SyncFilter;
}

// Helper types
export interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
  id_jenj_didik: string;
  nm_jenj_didik: string;
  id_sp: string;
  stat_prodi: string;
}

export interface SemesterOption {
  id_semester: string;
  nama_semester: string;
  tahun_ajaran: string;
  is_aktif: boolean;
}

// API Request/Response types
export interface GetAktivitasListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_semester: string; // comma-separated, MANDATORY
  id_prodi?: string;
  id_jenis_aktivitas?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SyncAktivitasParams {
  id_semester: string; // comma-separated, MANDATORY
  id_prodi?: string;
  synced_by: string;
  force_sync?: boolean;
}

export interface FeederAPIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
