/**
 * Dashboard Service
 *
 * Handle dashboard-service API operations:
 * - University Rankings
 * - University Profile
 * - Statistics
 */

import axios from 'axios';
import type {
  LatestRankingsResponse,
  RankingHistoryResponse,
  ChartDataResponse,
  CategoriesResponse,
  StatisticsResponse,
  ProgramStudiListResponse,
  ProgramStudiStatisticsResponse,
  ProgramStudiPeriodsResponse,
  ProgramStudiFilterOptionsResponse,
  ProgramStudiDetailResponse,
  DosenListResponse,
  MahasiswaTrendResponse,
  KurikulumListResponse,
  MataKuliahResponse,
  TracerStudyResponse,
  UnilaStatisticsResponse,
  UnilaProfileResponse,
} from '@/lib/types/dashboard.types';

// Dashboard Service Base URL - Via Kong Gateway
const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL;

/**
 * Dashboard Service Class
 */
class DashboardService {
  /**
   * Get latest rankings for all categories
   */
  async getLatestRankings(): Promise<LatestRankingsResponse> {
    try {
      const response = await axios.get<LatestRankingsResponse>(
        `${DASHBOARD_API_URL}/rankings/latest`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching latest rankings:', error);
      // Return empty but valid response instead of throwing
      return {
        success: false,
        message: 'Failed to fetch rankings',
        data: {
          rankings: [],
          university: 'Universitas Lampung',
          last_updated: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get ranking history for a specific category
   */
  async getRankingHistory(categoryCode: string): Promise<RankingHistoryResponse> {
    try {
      const response = await axios.get<RankingHistoryResponse>(
        `${DASHBOARD_API_URL}/rankings/${categoryCode}/history`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get chart data for visualization
   */
  async getChartData(
    startYear?: number,
    endYear?: number,
    categoryCode?: string
  ): Promise<ChartDataResponse> {
    try {
      const params = new URLSearchParams();
      if (startYear) params.append('start_year', startYear.toString());
      if (endYear) params.append('end_year', endYear.toString());
      if (categoryCode) params.append('category_code', categoryCode);

      const response = await axios.get<ChartDataResponse>(
        `${DASHBOARD_API_URL}/rankings/chart?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Return empty but valid response instead of throwing
      return {
        success: false,
        message: 'Failed to fetch chart data',
        data: {
          start_year: startYear || 2020,
          end_year: endYear || 2025,
          categories: []
        }
      };
    }
  }

  /**
   * Get all ranking categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axios.get<CategoriesResponse>(
        `${DASHBOARD_API_URL}/rankings/categories`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get ranking statistics
   */
  async getStatistics(): Promise<StatisticsResponse> {
    try {
      const response = await axios.get<StatisticsResponse>(
        `${DASHBOARD_API_URL}/rankings/statistics`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // Program Studi Methods
  // ============================================

  /**
   * Get program studi list with filters and pagination
   */
  async getProgramStudiList(params?: {
    periode?: string;
    jenjang?: string;
    akreditasi?: string;
    fakultas?: string;
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<ProgramStudiListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.periode) queryParams.append('periode', params.periode);
      if (params?.jenjang) queryParams.append('jenjang', params.jenjang);
      if (params?.akreditasi) queryParams.append('akreditasi', params.akreditasi);
      if (params?.fakultas) queryParams.append('fakultas', params.fakultas);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      const response = await axios.get<ProgramStudiListResponse>(
        `${DASHBOARD_API_URL}/program-studi?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get program studi statistics
   */
  async getProgramStudiStatistics(params?: {
    periode?: string;
    jenjang?: string;
    akreditasi?: string;
  }): Promise<ProgramStudiStatisticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.periode) queryParams.append('periode', params.periode);
      if (params?.jenjang) queryParams.append('jenjang', params.jenjang);
      if (params?.akreditasi) queryParams.append('akreditasi', params.akreditasi);

      const response = await axios.get<ProgramStudiStatisticsResponse>(
        `${DASHBOARD_API_URL}/program-studi/statistics?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available periods
   */
  async getProgramStudiPeriods(): Promise<ProgramStudiPeriodsResponse> {
    try {
      const response = await axios.get<ProgramStudiPeriodsResponse>(
        `${DASHBOARD_API_URL}/program-studi/periods`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get filter options
   */
  async getProgramStudiFilterOptions(): Promise<ProgramStudiFilterOptionsResponse> {
    try {
      const response = await axios.get<ProgramStudiFilterOptionsResponse>(
        `${DASHBOARD_API_URL}/program-studi/filter-options`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get program studi detail by ID
   */
  async getProgramStudiDetail(id: string, periode?: string): Promise<ProgramStudiDetailResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (periode) queryParams.append('periode', periode);

      const url = `${DASHBOARD_API_URL}/program-studi/${id}${periode ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get<ProgramStudiDetailResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching program studi detail:', error);
      throw error;
    }
  }

  /**
   * Get dosen list by program studi
   */
  async getDosenByProgramStudi(id: string): Promise<DosenListResponse> {
    try {
      const response = await axios.get<DosenListResponse>(
        `${DASHBOARD_API_URL}/program-studi/${id}/dosen`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dosen list:', error);
      throw error;
    }
  }

  /**
   * Get mahasiswa trend for 5 latest semesters
   */
  async getMahasiswaTrend(id: string): Promise<MahasiswaTrendResponse> {
    try {
      const response = await axios.get<MahasiswaTrendResponse>(
        `${DASHBOARD_API_URL}/program-studi/${id}/mahasiswa-trend`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching mahasiswa trend:', error);
      throw error;
    }
  }

  /**
   * Get kurikulum list by program studi
   */
  async getKurikulumByProgramStudi(id: string): Promise<KurikulumListResponse> {
    try {
      const response = await axios.get<KurikulumListResponse>(
        `${DASHBOARD_API_URL}/program-studi/${id}/kurikulum`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching kurikulum list:', error);
      throw error;
    }
  }

  /**
   * Get mata kuliah by kurikulum (grouped by semester)
   */
  async getMataKuliahByKurikulum(idKurikulum: string): Promise<MataKuliahResponse> {
    try {
      const response = await axios.get<MataKuliahResponse>(
        `${DASHBOARD_API_URL}/program-studi/kurikulum/${idKurikulum}/mata-kuliah`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching mata kuliah list:', error);
      throw error;
    }
  }

  /**
   * Get tracer study data by program studi
   */
  async getTracerStudyByProgramStudi(id: string): Promise<TracerStudyResponse> {
    try {
      const response = await axios.get<TracerStudyResponse>(
        `${DASHBOARD_API_URL}/program-studi/${id}/tracer-study`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tracer study data:', error);
      throw error;
    }
  }

  // ============================================
  // Unila Statistics Methods
  // ============================================

  /**
   * Get Universitas Lampung overall statistics
   */
  async getUnilaStatistics(): Promise<UnilaStatisticsResponse> {
    try {
      const response = await axios.get<UnilaStatisticsResponse>(
        `${DASHBOARD_API_URL}/unila/statistics`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // Unila Profile Methods
  // ============================================

  /**
   * Get Universitas Lampung profile information
   */
  async getUnilaProfile(): Promise<UnilaProfileResponse> {
    try {
      const response = await axios.get<UnilaProfileResponse>(
        `${DASHBOARD_API_URL}/unila/profile`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

export default dashboardService;
