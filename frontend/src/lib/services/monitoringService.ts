/**
 * Monitoring Service
 * Handles API calls for monitoring active sync operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || "http://localhost:8083/public";

export interface SyncProgress {
  id: string;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: string; // manual, batch, scheduled
  status: string; // running, completed, failed
  progress: number; // 0-100
  current_record: number;
  total_records: number;
  started_at: string;
  updated_at: string;
  message: string;
  synced_by: string;
  error?: string;
}

export interface MonitoringStats {
  active_syncs: number;
  completed_today: number;
  failed_today: number;
  total_duration: number; // in milliseconds
  last_sync_at: string;
}

export interface MonitoringResponse {
  active_syncs: SyncProgress[];
  stats: MonitoringStats;
  updated_at: string;
}

class MonitoringService {
  /**
   * Get all active sync operations
   */
  async getActiveSyncs(): Promise<MonitoringResponse> {
    const response = await fetch(`${API_BASE_URL}/monitoring/active`);
    if (!response.ok) {
      throw new Error("Failed to fetch active syncs");
    }
    return response.json();
  }

  /**
   * Get specific sync operation by ID
   */
  async getSyncById(id: string): Promise<SyncProgress> {
    const response = await fetch(`${API_BASE_URL}/monitoring/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch sync details");
    }
    return response.json();
  }
}

export const monitoringService = new MonitoringService();
