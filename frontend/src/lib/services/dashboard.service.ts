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
} from '@/lib/types/dashboard.types';

// Dashboard Service Base URL - Via Kong Gateway
const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

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
      throw error;
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
      throw error;
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
}

// Export singleton instance
export const dashboardService = new DashboardService();

export default dashboardService;
