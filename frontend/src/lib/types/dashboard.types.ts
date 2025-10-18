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
