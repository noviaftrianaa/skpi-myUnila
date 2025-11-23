/**
 * Monitoring Service
 * Handles API calls for monitoring active sync operations
 */

import { sisterClient } from '@/lib/api/sisterClient';

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
    const response = await sisterClient.get<MonitoringResponse>('/monitoring/active');
    return response.data;
  }

  /**
   * Get specific sync operation by ID
   */
  async getSyncById(id: string): Promise<SyncProgress> {
    const response = await sisterClient.get<SyncProgress>(`/monitoring/${id}`);
    return response.data;
  }
}

export const monitoringService = new MonitoringService();
