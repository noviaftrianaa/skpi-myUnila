/**
 * Sync Logs Service
 * Handles API calls for viewing synchronization logs from Sister Integrator
 */

// Direct connection to sister-service
const SISTER_API_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL || "http://localhost:8083/public";

export interface SyncLog {
  id: number;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: "manual" | "batch" | "scheduled";
  status: "success" | "failed" | "partial";
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  duration_ms: number | null;
  error_message: string | null;
  error_details: string | null;
  synced_by: string;
  synced_at: string;
}

export interface SyncLogFilter {
  search?: string;
  endpoint_key?: string;
  status?: "success" | "failed" | "partial";
  sync_type?: "manual" | "batch" | "scheduled";
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface SyncLogResponse {
  data: SyncLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const syncLogsService = {
  /**
   * Get sync logs with filtering and pagination
   */
  async getSyncLogs(filter?: SyncLogFilter): Promise<SyncLogResponse> {
    try {
      const params = new URLSearchParams();

      if (filter?.search) params.append("search", filter.search);
      if (filter?.endpoint_key) params.append("endpoint_key", filter.endpoint_key);
      if (filter?.status) params.append("status", filter.status);
      if (filter?.sync_type) params.append("sync_type", filter.sync_type);
      if (filter?.date_from) params.append("date_from", filter.date_from);
      if (filter?.date_to) params.append("date_to", filter.date_to);
      if (filter?.page) params.append("page", filter.page.toString());
      if (filter?.limit) params.append("limit", filter.limit.toString());

      const url = `${SISTER_API_BASE}/sync-logs${params.toString() ? `?${params.toString()}` : ""}`;
      console.log("🔍 Fetching sync logs from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SyncLogResponse = await response.json();
      console.log("✅ Sync logs fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching sync logs:", error);
      throw error;
    }
  },

  /**
   * Get a single sync log by ID
   */
  async getSyncLogById(id: number): Promise<SyncLog> {
    try {
      console.log(`🔍 Fetching sync log #${id}`);

      const response = await fetch(`${SISTER_API_BASE}/sync-logs/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Sync log not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SyncLog = await response.json();
      console.log("✅ Sync log fetched successfully:", data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching sync log #${id}:`, error);
      throw error;
    }
  },

  /**
   * Get recent sync logs (default: 10, max: 100)
   */
  async getRecentSyncLogs(limit: number = 10): Promise<SyncLog[]> {
    try {
      console.log(`🔍 Fetching ${limit} recent sync logs`);

      const response = await fetch(`${SISTER_API_BASE}/sync-logs?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data: SyncLog[] = result.data || [];
      console.log("✅ Recent sync logs fetched successfully:", data.length, "logs");
      return data;
    } catch (error) {
      console.error("❌ Error fetching recent sync logs:", error);
      throw error;
    }
  },

  /**
   * Get sync logs statistics for dashboard
   */
  async getSyncStats(): Promise<{
    totalSyncs: number;
    successRate: number;
    failedSyncs: number;
    averageDuration: number;
  }> {
    try {
      // Get all sync logs (we'll compute stats from the data)
      const response = await this.getSyncLogs({ limit: 1000 });

      const totalSyncs = response.total;
      const successCount = response.data.filter((log) => log.status === "success").length;
      const failedCount = response.data.filter((log) => log.status === "failed").length;
      const successRate = totalSyncs > 0 ? (successCount / totalSyncs) * 100 : 0;

      const durations = response.data.filter((log) => log.duration_ms !== null).map((log) => log.duration_ms!);
      const averageDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

      return {
        totalSyncs,
        successRate,
        failedSyncs: failedCount,
        averageDuration,
      };
    } catch (error) {
      console.error("❌ Error fetching sync stats:", error);
      throw error;
    }
  },
};
