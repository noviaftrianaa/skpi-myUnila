/**
 * Sync Logs Service
 * Handles API calls for viewing synchronization logs from Sister Integrator
 */

import { sisterClient } from '../api/sisterClient';

export interface SyncLog {
  id: number;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: "manual" | "batch" | "scheduled";
  status: "success" | "failed" | "partial";
  api_code: string; // API source identifier (SISTER)
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
   * Always filters by api_code=SISTER to only show Sister logs
   */
  async getSyncLogs(filter?: SyncLogFilter): Promise<SyncLogResponse> {
    try {
      const params: Record<string, string> = {
        // IMPORTANT: Always filter by SISTER to only show sister logs
        api_code: 'SISTER'
      };

      if (filter?.search) params.search = filter.search;
      if (filter?.endpoint_key) params.endpoint_key = filter.endpoint_key;
      if (filter?.status) params.status = filter.status;
      if (filter?.sync_type) params.sync_type = filter.sync_type;
      if (filter?.date_from) params.date_from = filter.date_from;
      if (filter?.date_to) params.date_to = filter.date_to;
      if (filter?.page) params.page = filter.page.toString();
      if (filter?.limit) params.limit = filter.limit.toString();

      const response = await sisterClient.get<SyncLogResponse>('/logs/sync', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sync logs:", error);
      throw error;
    }
  },

  /**
   * Get a single sync log by ID
   */
  async getSyncLogById(id: number): Promise<SyncLog> {
    try {
      const response = await sisterClient.get<SyncLog>(`/logs/sync/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sync log #${id}:`, error);
      throw error;
    }
  },

  /**
   * Get recent sync logs (default: 10, max: 100)
   */
  async getRecentSyncLogs(limit: number = 10): Promise<SyncLog[]> {
    try {
      const response = await sisterClient.get<SyncLogResponse>('/logs/sync', {
        params: { limit: limit.toString() }
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching recent sync logs:", error);
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
      console.error("Error fetching sync stats:", error);
      throw error;
    }
  },
};
