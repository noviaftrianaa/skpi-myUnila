/**
 * Dashboard Types
 *
 * Shared types untuk semua dashboard aplikasi
 */

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
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
    belum_akreditasi: number;
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
