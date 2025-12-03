/**
 * Dashboard Types
 *
 * Shared types untuk semua dashboard aplikasi
 */

export interface MenuItem {
  title: string;
  icon?: React.ReactNode; // Optional for children/submenu items
  href?: string;
  children?: MenuItem[];
  roles?: string[]; // Roles yang boleh akses menu ini
}

export interface DashboardConfig {
  appName: string;
  appIcon?: React.ReactNode;
  menuItems: MenuItem[];
}

export type UserRole = "admin" | "mahasiswa" | "dosen" | string;

// ============================================
// University Rankings Types
// ============================================

/**
 * Ranking Category
 */
export interface RankingCategory {
  code: string;
  name: string;
  full_name: string;
  icon: string;
  color: string;
  website?: string;
  description?: string;
}

/**
 * Ranking Data
 */
export interface Ranking {
  category: RankingCategory;
  year: string;
  period: string | null;
  ranks: {
    world: string;
    world_numeric: number | null;
    national: number | null;
    regional: number | null;
  };
  score: number | null;
  change: number | null;
  trend: 'up' | 'down' | 'stable' | 'new';
  source_url: string;
  last_updated: string;
}

/**
 * Latest Rankings Response
 */
export interface LatestRankingsResponse {
  success: boolean;
  message: string;
  data: {
    rankings: Ranking[];
    university: string;
    last_updated: string;
  };
}

/**
 * Ranking History Item
 */
export interface RankingHistoryItem {
  year: string;
  period: string | null;
  world_rank: string;
  world_rank_numeric: number | null;
  national_rank: number | null;
  score: number | null;
  change: number | null;
  trend: string;
  updated_at: string;
}

/**
 * Ranking History Response
 */
export interface RankingHistoryResponse {
  success: boolean;
  message: string;
  data: {
    category: string;
    history: RankingHistoryItem[];
  };
}

/**
 * Chart Data Category
 */
export interface ChartDataCategory {
  category: RankingCategory;
  data: {
    year: string;
    period: string | null;
    world_rank: string;
    world_rank_numeric: number | null;
    national_rank: number | null;
    score: number | null;
    change: number | null;
    trend: string;
  }[];
}

/**
 * Chart Data Response
 */
export interface ChartDataResponse {
  success: boolean;
  message: string;
  data: {
    start_year: number;
    end_year: number;
    categories: ChartDataCategory[];
  };
}

/**
 * Categories Response
 */
export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: RankingCategory[];
  };
}

/**
 * Statistics Response
 */
export interface StatisticsResponse {
  success: boolean;
  message: string;
  data: {
    overview: {
      total_categories: string;
      total_records: string;
      year_range: {
        start: string;
        end: string;
      };
      average_ranks: {
        world: number;
        national: number;
      };
    };
    best_performances: {
      category: string;
      best_world_rank: string;
      best_national_rank: number | null;
    }[];
  };
}

// ============================================
// Program Studi Types
// ============================================

/**
 * Program Studi Item
 */
export interface ProgramStudi {
  id: string;
  encrypted_id?: string; // Encrypted ID for secure links
  kode: string;
  nama: string;
  status: string;
  jenjang: string;
  akreditasi: string;
  fakultas: string | null;
  jurusan: string | null;
  dosen_tetap: number;
  dosen_tidak_tetap: number;
  dosen_pns: number;
  dosen_non_pns: number;
  total_dosen: number;
  total_tendik: number;
  total_mahasiswa: number;
  rasio: string;
  periode: string;
}

/**
 * Program Studi List Response
 */
export interface ProgramStudiListResponse {
  success: boolean;
  message: string;
  data: ProgramStudi[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

/**
 * Program Studi Statistics
 */
export interface ProgramStudiStatistics {
  total_prodi: number;
  total_dosen: number;
  total_tendik: number;
  total_mahasiswa: number;
  avg_rasio: number;
  akreditasi_count: {
    unggul: number;
    baik_sekali: number;
    baik: number;
    a: number;
    b: number;
    c: number;
    tidak_terakreditasi: number;
    belum_terakreditasi: number;
  };
  jenjang_count: {
    S3: number;
    S2: number;
    S1: number;
    D4: number;
    D3: number;
  };
  periode: string;
}

/**
 * Program Studi Statistics Response
 */
export interface ProgramStudiStatisticsResponse {
  success: boolean;
  message: string;
  data: ProgramStudiStatistics;
}

/**
 * Program Studi Period
 */
export interface ProgramStudiPeriod {
  id_smt: string;
  name: string;
  year: string;
  is_active?: boolean;
}

/**
 * Program Studi Periods Response
 */
export interface ProgramStudiPeriodsResponse {
  success: boolean;
  message: string;
  data: ProgramStudiPeriod[];
}

/**
 * Program Studi Filter Options
 */
export interface ProgramStudiFilterOptions {
  fakultas: string[];
  jenjang: string[];
  akreditasi: string[];
}

/**
 * Program Studi Filter Options Response
 */
export interface ProgramStudiFilterOptionsResponse {
  success: boolean;
  message: string;
  data: ProgramStudiFilterOptions;
}

/**
 * Program Studi Detail
 */
export interface ProgramStudiDetail {
  id: string;
  id_original: string;
  kode: string;
  nama: string;
  status: string;
  jenjang: string;
  tanggal_berdiri: string;
  sk_penyelenggara: string;
  akreditasi: string;
  riwayat_akreditasi?: Array<{
    peringkat: string;
    no_sk: string;
    tanggal_sk: string | null;
    tanggal_berakhir: string | null;
    lembaga_akreditasi: string;
  }>;
  organisasi: {
    fakultas: {
      id: string | null;
      nama: string | null;
    };
    jurusan: {
      id: string | null;
      nama: string | null;
    };
  };
  profil: {
    visi: string | null;
    misi: string | null;
    tujuan: string | null;
    sasaran: string | null;
    kompetensi: string | null;
    capaian_belajar: string | null;
    deskripsi_singkat: string | null;
  };
  sdm: {
    dosen: {
      tetap: number;
      tidak_tetap: number;
      pns: number;
      non_pns: number;
      total: number;
    };
    tendik: number;
  };
  mahasiswa: {
    total: number;
  };
  rasio_dosen_mahasiswa: string;
  periode: string;
}

/**
 * Program Studi Detail Response
 */
export interface ProgramStudiDetailResponse {
  success: boolean;
  message: string;
  data: ProgramStudiDetail;
}

/**
 * Dosen Item
 */
export interface Dosen {
  id: string;
  nama: string;
  nidn: string;
  nuptk: string;
  jenis_kelamin: string;
  ikatan_kerja: {
    id: string;
    nama: string;
    status: string;
  };
  jabatan_fungsional: string;
  pendidikan_terakhir: string;
  status_keaktifan: {
    id: number;
    nama: string;
    status: string;
  };
}

/**
 * Dosen List Response
 */
export interface DosenListResponse {
  success: boolean;
  message: string;
  data: Dosen[];
}

/**
 * Mahasiswa Trend Item
 */
export interface MahasiswaTrendItem {
  semester: string;
  nama_semester: string;
  total_mahasiswa: number;
}

/**
 * Mahasiswa Trend Response
 */
export interface MahasiswaTrendResponse {
  success: boolean;
  message: string;
  data: MahasiswaTrendItem[];
}

/**
 * Mahasiswa Item (for list)
 */
export interface MahasiswaItem {
  npm: string;
  nama: string;
  angkatan: string;
  status: string;
}

/**
 * Mahasiswa List Response
 */
export interface MahasiswaListResponse {
  success: boolean;
  message: string;
  data: MahasiswaItem[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

/**
 * Kurikulum Item
 */
export interface Kurikulum {
  id: string;
  nama: string;
  sks_lulus: number;
  sks_wajib: number;
  sks_pilihan: number;
  jumlah_semester_normal: number;
  digunakan: boolean;
  jenjang: {
    id: string;
    nama: string;
  };
  semester: {
    id: string;
    nama: string;
  };
  prodi: {
    id: string;
    nama: string;
  };
}

/**
 * Kurikulum List Response
 */
export interface KurikulumListResponse {
  success: boolean;
  message: string;
  data: Kurikulum[];
}

/**
 * Mata Kuliah Item
 */
export interface MataKuliah {
  kode: string;
  nama: string;
  sks: number;
  sks_tm: number;
  sks_prak: number;
  sks_prak_lap: number;
  sks_sim: number;
  status_wajib: string;
  is_wajib: boolean;
}

/**
 * Semester Mata Kuliah (Grouped by Semester)
 */
export interface SemesterMataKuliah {
  semester_ke: number;
  mata_kuliah: MataKuliah[];
  total_sks: number;
  total_sks_wajib: number;
  total_sks_pilihan: number;
  jumlah_matkul: number;
  jumlah_wajib: number;
  jumlah_pilihan: number;
}

/**
 * Mata Kuliah Response
 */
export interface MataKuliahResponse {
  success: boolean;
  message: string;
  data: SemesterMataKuliah[];
}

// ============================================
// Tracer Study Types
// ============================================

/**
 * Kesesuaian Bidang Kerja
 */
export interface KesesuaianBidang {
  tingkat: number;
  label: string;
  jumlah: number;
}

/**
 * Level Perusahaan
 */
export interface LevelPerusahaan {
  level: string;
  jumlah: number;
}

/**
 * Waktu Tunggu Trend
 */
export interface WaktuTungguTrend {
  tahun: number;
  avg_waktu_tunggu: number;
  jumlah: number;
}

/**
 * Status Lulusan
 */
export interface StatusLulusan {
  bekerja: number;
  wiraswasta: number;
  kuliah_lanjut: number;
  belum_bekerja: number;
}

/**
 * Tracer Study Data
 */
export interface TracerStudyData {
  total_alumni: number;
  avg_waktu_tunggu: number;
  avg_income: number;
  bekerja_sebelum_lulus: number;
  persentase_bekerja_sebelum_lulus: number;
  status_lulusan: StatusLulusan;
  kesesuaian_bidang: KesesuaianBidang[];
  level_perusahaan: LevelPerusahaan[];
  waktu_tunggu_trend: WaktuTungguTrend[];
}

/**
 * Tracer Study Response
 */
export interface TracerStudyResponse {
  success: boolean;
  message: string;
  data: TracerStudyData;
}

// ============================================
// Unila Statistics Types
// ============================================

/**
 * Unila Statistics
 */
export interface UnilaStatistics {
  mahasiswa_aktif: number;
  dosen: number;
  tendik: number;
  fakultas: number;
  pascasarjana: number;
  program_studi: number;
  guru_besar: number;
  publikasi: number;
  periode: string;
}

/**
 * Unila Statistics Response
 */
export interface UnilaStatisticsResponse {
  success: boolean;
  message: string;
  data: UnilaStatistics;
}

// ============================================
// Unila Profile Types
// ============================================

/**
 * Unila Profile
 */
export interface UnilaProfile {
  id_sp: string;
  nama_lengkap: string;
  nama_singkat: string;
  kode_pt: string;
  alamat: string;
  kota: string;
  kode_pos: string;
  telepon: string;
  fax: string;
  email: string;
  website: string;
  status_pt: string;
  sk_pendirian: string;
  tanggal_sk_pendirian: string | null;
  tanggal_berdiri: string | null;
  luas_tanah_milik: number;
  luas_tanah_bukan_milik: number;
  npwp: string | null;
  akreditasi: string | null;
  sk_akreditasi: string | null;
  tanggal_sk_akreditasi: string | null;
  tanggal_berakhir_akreditasi: string | null;
  biaya_kuliah: {
    min: number;
    max: number;
  };
}

/**
 * Unila Profile Response
 */
export interface UnilaProfileResponse {
  success: boolean;
  message: string;
  data: UnilaProfile;
}

// ============================================
// Sebaran Program Studi Types
// ============================================

/**
 * Jenjang Count
 */
export interface JenjangCount {
  jenjang: string;
  jumlah: number;
}

/**
 * Fakultas Data with Jenjang Breakdown
 */
export interface FakultasSebaranData {
  id: string;
  nama: string;
  total_prodi: number;
  jenjang_counts: JenjangCount[];
}

/**
 * Prodi Data
 */
export interface ProdiSebaranData {
  id: string;
  nama: string;
  kode_prodi: string;
  jenjang: string;
  akreditasi?: string;
}

/**
 * Sebaran Statistics
 */
export interface SebaranStatistics {
  total_prodi: number;
  total_fakultas: number;
  total_d3: number;
  total_d4?: number;
  total_s1: number;
  total_s2: number;
  total_s3: number;
  total_profesi?: number;
  total_sp1?: number;
}

/**
 * Sebaran Fakultas Response
 */
export interface SebaranFakultasResponse {
  success: boolean;
  message: string;
  data: {
    fakultas: FakultasSebaranData[];
    statistics: SebaranStatistics;
  };
}

/**
 * Prodi by Fakultas Response
 */
export interface ProdiByFakultasResponse {
  success: boolean;
  message: string;
  data: ProdiSebaranData[];
}

// ============================================
// Mahasiswa Statistics Types (Charts)
// ============================================

/**
 * Trend Item (5 tahun terakhir)
 */
export interface MahasiswaTrendYearItem {
  tahun: string;
  jumlah_mahasiswa: number;
}

/**
 * Mahasiswa Aktif Trend Response
 */
export interface MahasiswaAktifTrendResponse {
  success: boolean;
  message: string;
  data: {
    data: MahasiswaTrendYearItem[];
    total_years: number;
  };
}

/**
 * Jenjang Distribution Item
 */
export interface JenjangDistributionItem {
  jenjang: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Sebaran Jenjang Response
 */
export interface SebaranJenjangResponse {
  success: boolean;
  message: string;
  data: {
    data: JenjangDistributionItem[];
    total_mahasiswa: number;
  };
}

/**
 * Status Distribution Item
 */
export interface StatusDistributionItem {
  status: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Sebaran Status Response
 */
export interface SebaranStatusResponse {
  success: boolean;
  message: string;
  data: {
    data: StatusDistributionItem[];
    total_mahasiswa: number;
  };
}

/**
 * Jenis Kelamin Distribution Item
 */
export interface JenisKelaminDistributionItem {
  jenis_kelamin: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Sebaran Jenis Kelamin Response
 */
export interface SebaranJenisKelaminResponse {
  success: boolean;
  message: string;
  data: {
    data: JenisKelaminDistributionItem[];
    total_mahasiswa: number;
  };
}

/**
 * Jalur Daftar Distribution Item
 */
export interface JalurDaftarDistributionItem {
  jalur_daftar: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Sebaran Jalur Daftar Response
 */
export interface SebaranJalurDaftarResponse {
  success: boolean;
  message: string;
  data: {
    data: JalurDaftarDistributionItem[];
    total_mahasiswa: number;
  };
}

/**
 * Jenis Pendaftaran Distribution Item
 */
export interface JenisPendaftaranDistributionItem {
  jenis_pendaftaran: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Pembiayaan Distribution Item
 */
export interface PembiayaanDistributionItem {
  pembiayaan: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

/**
 * Mahasiswa Asing by Negara
 */
export interface MahasiswaAsingNegaraItem {
  negara: string;
  jumlah_mahasiswa: number;
}

/**
 * Lokal vs Asing Item
 */
export interface LokalVsAsingItem {
  kategori: string;
  jumlah_mahasiswa: number;
}

/**
 * Sebaran Mahasiswa Asing Response
 */
export interface SebaranMahasiswaAsingResponse {
  success: boolean;
  message: string;
  data: {
    data: MahasiswaAsingNegaraItem[];
    total_mahasiswa_asing: number;
    lokal_vs_asing: LokalVsAsingItem[];
  };
}

/**
 * Statistics Summary
 */
export interface MahasiswaStatisticsSummary {
  total_mahasiswa_aktif: number;
  total_mahasiswa_lokal: number;
  total_mahasiswa_asing: number;
  periode: string;
}

/**
 * All Mahasiswa Statistics Combined Response
 */
export interface MahasiswaAllStatisticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: MahasiswaStatisticsSummary;
    trend: {
      data: MahasiswaTrendYearItem[];
      total_years: number;
    };
    jenjang: {
      data: JenjangDistributionItem[];
      total_mahasiswa: number;
    };
    status: {
      data: StatusDistributionItem[];
      total_mahasiswa: number;
    };
    jenis_kelamin: {
      data: JenisKelaminDistributionItem[];
      total_mahasiswa: number;
    };
    jalur_daftar: {
      data: JalurDaftarDistributionItem[];
      total_mahasiswa: number;
    };
    jenis_pendaftaran: {
      data: JenisPendaftaranDistributionItem[];
      total_mahasiswa: number;
    };
    pembiayaan: {
      data: PembiayaanDistributionItem[];
      total_mahasiswa: number;
    };
    mahasiswa_asing: {
      data: MahasiswaAsingNegaraItem[];
      total_mahasiswa_asing: number;
      lokal_vs_asing: LokalVsAsingItem[];
    };
  };
}
