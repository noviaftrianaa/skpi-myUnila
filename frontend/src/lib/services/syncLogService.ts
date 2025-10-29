/**
 * Service for Sync Logs API
 */

export interface SyncLog {
  id: number;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: string; // manual, batch, scheduled
  status: string; // success, failed, partial
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  duration_ms: number;
  error_message: string;
  error_details: string;
  synced_by: string;
  synced_at: string;
}

export interface SyncLogStats {
  total_syncs: number;
  success_count: number;
  failed_count: number;
  partial_count: number;
  total_records: number;
  total_inserted: number;
  total_updated: number;
  total_failed: number;
  avg_duration_ms: number;
  last_sync_at?: string;
}

export interface SyncLogListRequest {
  page?: number;
  limit?: number;
  status?: string;
  endpoint_key?: string;
  sync_type?: string;
  search?: string;
}

export interface SyncLogListResponse {
  data: SyncLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || "http://localhost:8083/public";

class SyncLogService {
  /**
   * Get sync logs statistics
   */
  async getStats(): Promise<SyncLogStats> {
    const response = await fetch(`${API_BASE_URL}/sync-logs/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch sync log stats");
    }
    return response.json();
  }

  /**
   * Get sync logs list with pagination and filtering
   */
  async getList(params: SyncLogListRequest = {}): Promise<SyncLogListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.endpoint_key) queryParams.append("endpoint_key", params.endpoint_key);
    if (params.sync_type) queryParams.append("sync_type", params.sync_type);
    if (params.search) queryParams.append("search", params.search);

    const url = `${API_BASE_URL}/sync-logs?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch sync logs");
    }

    return response.json();
  }

  /**
   * Get sync log by ID
   */
  async getById(id: number): Promise<SyncLog> {
    const response = await fetch(`${API_BASE_URL}/sync-logs/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch sync log");
    }
    return response.json();
  }

  /**
   * Get sync logs statistics by endpoint
   */
  async getStatsByEndpoint(endpointKey: string): Promise<SyncLogStats> {
    const response = await fetch(`${API_BASE_URL}/sync-logs/stats/${endpointKey}`);
    if (!response.ok) {
      throw new Error("Failed to fetch sync log stats by endpoint");
    }
    return response.json();
  }
}

export const syncLogService = new SyncLogService();
