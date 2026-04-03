/**
 * TypeScript interfaces untuk SI KKN (SIKNILA)
 * Mengikuti schema SQL Server siknila
 */

// ============ ref schema ============

export interface PeriodeKkn {
  id_periode: string;
  nm_periode: string;
  tahun_akademik: string;
  semester: "ganjil" | "genap";
  tgl_mulai_daftar: string;
  tgl_selesai_daftar: string;
  tgl_mulai_kkn: string;
  tgl_selesai_kkn: string;
  kuota_peserta: number;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface LokasiKkn {
  id_lokasi: string;
  id_wilayah: string;
  nm_desa: string;
  nm_kecamatan: string;
  nm_kabupaten: string;
  provinsi: string;
  kode_pos: string | null;
  alamat_posko: string | null;
  latitude: number | null;
  longitude: number | null;
  kuota_mahasiswa: number;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface WilayahKkn {
  id_wilayah: string;
  nm_wilayah: string;
  nm_kabupaten: string;
  provinsi: string;
  deskripsi: string | null;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface JenisDokumen {
  id_jenis_dokumen: string;
  kode_dokumen: string;
  nm_dokumen: string;
  deskripsi: string | null;
  tipe_file: string;
  ukuran_maks_mb: number;
  apakah_wajib: boolean;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface KomponenPenilaian {
  id_komponen: string;
  kode_komponen: string;
  nm_komponen: string;
  bobot_persen: number;
  penilai: "dpl" | "pamong" | "admin";
  deskripsi: string | null;
  urutan: number;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface KriteriaPendaftaran {
  id_kriteria: string;
  kode_kriteria: string;
  nm_kriteria: string;
  nilai_minimum: string;
  deskripsi: string | null;
  apakah_aktif: boolean;
  created_at: string;
  updated_at: string;
}

// ============ pendaftaran schema ============

export type StatusRegistrasi = "draft" | "diajukan" | "diterima" | "ditolak" | "mengundurkan_diri";

export interface RegistrasiKkn {
  id_registrasi: string;
  id_periode: string;
  id_mahasiswa: string;
  npm: string;
  nm_mahasiswa: string;
  id_prodi: string;
  nm_prodi: string;
  id_fakultas: string;
  nm_fakultas: string;
  semester: number;
  ipk: number;
  total_sks: number;
  no_hp: string | null;
  email: string | null;
  status: StatusRegistrasi;
  alasan_penolakan: string | null;
  tgl_daftar: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_periode?: string;
  data_pemohon?: DataPemohonKkn;
  verifikasi_syarat?: VerifikasiSyarat[];
}

export interface DataPemohonKkn {
  id_data_pemohon: string;
  id_registrasi: string;
  alamat_asal: string | null;
  no_hp_ortu: string | null;
  riwayat_penyakit: string | null;
  ukuran_baju: string | null;
  preferensi_lokasi: string | null;
  pengalaman_organisasi: string | null;
  keahlian_khusus: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifikasiSyarat {
  id_verifikasi: string;
  id_registrasi: string;
  id_kriteria: string;
  nm_kriteria: string;
  nilai_aktual: string;
  apakah_terpenuhi: boolean;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

// ============ kelompok schema ============

export type StatusKelompok = "dibentuk" | "aktif" | "selesai" | "dibatalkan";
export type PeranAnggota = "ketua" | "sekretaris" | "bendahara" | "anggota";
export type StatusAnggota = "aktif" | "keluar" | "pindah";

export interface KelompokKkn {
  id_kelompok: string;
  id_periode: string;
  id_lokasi: string;
  kode_kelompok: string;
  nm_kelompok: string;
  status: StatusKelompok;
  jumlah_anggota: number;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_periode?: string;
  nm_desa?: string;
  nm_kecamatan?: string;
  nm_kabupaten?: string;
  anggota?: AnggotaKelompok[];
  dpl?: DplKelompok;
  pamong?: PamongDesa;
}

export interface AnggotaKelompok {
  id_anggota: string;
  id_kelompok: string;
  id_registrasi: string;
  id_mahasiswa: string;
  npm: string;
  nm_mahasiswa: string;
  nm_prodi: string;
  nm_fakultas: string;
  peran: PeranAnggota;
  status: StatusAnggota;
  tgl_bergabung: string;
  tgl_keluar: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface DplKelompok {
  id_dpl: string;
  id_kelompok: string;
  id_dosen: string;
  nidn: string;
  nm_dosen: string;
  nm_prodi: string;
  nm_fakultas: string;
  no_hp: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface PamongDesa {
  id_pamong: string;
  id_kelompok: string;
  nm_pamong: string;
  jabatan: string;
  instansi: string;
  no_hp: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
}

// ============ kegiatan schema ============

export type BidangProker = "pendidikan" | "kesehatan" | "ekonomi" | "infrastruktur" | "lingkungan" | "sosial_budaya" | "teknologi";
export type StatusProker = "rencana" | "berjalan" | "selesai" | "batal";
export type StatusLogbook = "draft" | "diajukan" | "disetujui_dpl";
export type StatusHadir = "hadir" | "izin" | "sakit" | "alpha";

export interface ProgramKerja {
  id_proker: string;
  id_kelompok: string;
  judul: string;
  deskripsi: string | null;
  bidang: BidangProker;
  status: StatusProker;
  tgl_mulai: string;
  tgl_selesai: string | null;
  lokasi_kegiatan: string | null;
  anggaran: number | null;
  target_sasaran: string | null;
  capaian: string | null;
  created_at: string;
  updated_at: string;
}

export interface LogbookHarian {
  id_logbook: string;
  id_anggota: string;
  id_kelompok: string;
  tanggal: string;
  judul_kegiatan: string;
  deskripsi_kegiatan: string;
  jam_mulai: string;
  jam_selesai: string;
  hasil_kegiatan: string | null;
  kendala: string | null;
  dokumentasi_path: string | null;
  status: StatusLogbook;
  catatan_dpl: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_mahasiswa?: string;
  npm?: string;
}

export interface LaporanKelompok {
  id_laporan: string;
  id_kelompok: string;
  jenis_laporan: "harian" | "mingguan" | "akhir";
  judul: string;
  isi_laporan: string | null;
  file_path: string | null;
  tgl_laporan: string;
  created_at: string;
  updated_at: string;
}

export interface Absensi {
  id_absensi: string;
  id_anggota: string;
  id_kelompok: string;
  tanggal: string;
  status_hadir: StatusHadir;
  jam_datang: string | null;
  jam_pulang: string | null;
  keterangan: string | null;
  lokasi_lat: number | null;
  lokasi_lng: number | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_mahasiswa?: string;
  npm?: string;
}

export interface CatatanBimbingan {
  id_catatan: string;
  id_kelompok: string;
  id_dpl: string;
  tanggal: string;
  topik: string;
  isi_bimbingan: string;
  catatan_tindak_lanjut: string | null;
  peserta_hadir: string[];
  created_at: string;
  updated_at: string;
  // joined
  nm_dosen?: string;
}

// ============ penilaian schema ============

export interface NilaiMahasiswa {
  id_nilai: string;
  id_anggota: string;
  id_komponen: string;
  id_penilai: string;
  nm_penilai: string;
  nilai: number;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_mahasiswa?: string;
  npm?: string;
  nm_komponen?: string;
  kode_komponen?: string;
}

export type NilaiHuruf = "A" | "AB" | "B" | "BC" | "C" | "D" | "E";

export interface NilaiAkhir {
  id_nilai_akhir: string;
  id_anggota: string;
  id_kelompok: string;
  id_mahasiswa: string;
  npm: string;
  nm_mahasiswa: string;
  nm_prodi: string;
  nm_fakultas: string;
  total_nilai: number;
  nilai_huruf: NilaiHuruf;
  apakah_lulus: boolean;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface PenilaianPamong {
  id_penilaian_pamong: string;
  id_anggota: string;
  id_pamong: string;
  nm_pamong: string;
  nilai_sikap: number;
  nilai_kerjasama: number;
  nilai_inisiatif: number;
  nilai_kehadiran: number;
  nilai_rata_rata: number;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // joined
  nm_mahasiswa?: string;
  npm?: string;
}

// ============ dokumen schema ============

export interface DokumenKkn {
  id_dokumen: string;
  id_kelompok: string | null;
  id_anggota: string | null;
  id_jenis_dokumen: string;
  kode_dokumen: string;
  nm_file: string;
  file_path: string | null;
  tipe_file: string;
  ukuran_byte: number;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sertifikat {
  id_sertifikat: string;
  id_anggota: string;
  id_periode: string;
  no_sertifikat: string;
  nm_mahasiswa: string;
  npm: string;
  nm_prodi: string;
  nm_fakultas: string;
  nm_lokasi: string;
  nm_kelompok: string;
  tgl_terbit: string;
  file_path: string | null;
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

export interface DashboardStatsKkn {
  total_peserta: number;
  peserta_aktif: number;
  total_kelompok: number;
  kelompok_aktif: number;
  total_lokasi: number;
  total_dpl: number;
  pendaftar_baru: number;
  logbook_hari_ini: number;
  rata_rata_nilai: number;
  tingkat_kelulusan: number;
}
