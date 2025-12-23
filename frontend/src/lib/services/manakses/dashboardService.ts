import { authClient } from "@/lib/api/authClient";

export interface DashboardStats {
  total_pengguna: number;
  pengguna_aktif: number;
  total_aplikasi: number;
  aplikasi_aktif: number;
  total_peran: number;
  peran_aktif: number;
  total_endpoint: number;
  endpoint_aktif: number;
  total_unit: number;
  total_kategori: number;
  total_menu: number;
}

export interface RecentActivity {
  id_log_login: string;
  username: string;
  email: string;
  status: string;
  waktu_login: string;
  ip_address: string;
  browser: string;
  os: string;
  nm_aplikasi: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await authClient.get<{
      success: boolean;
      data: DashboardStats;
    }>("/manakses/dashboard/stats");

    if (!response.data.success) {
      throw new Error("Failed to fetch dashboard stats");
    }

    return response.data.data;
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await authClient.get<{
      success: boolean;
      data: RecentActivity[];
    }>("/manakses/dashboard/recent-activities");

    if (!response.data.success) {
      throw new Error("Failed to fetch recent activities");
    }

    return response.data.data;
  },
};
