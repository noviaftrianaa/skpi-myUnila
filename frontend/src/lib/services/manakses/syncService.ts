/**
 * Sync Service
 * Service untuk sync data dari Radius DB ke ManAkses
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface SyncProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
  success: number;
  failed: number;
  percentage: number;
  current_chunk: number;
  total_chunks: number;
  started_at: number | null;
  elapsed_time: number;
}

export interface SyncStatus {
  is_running: boolean;
  status: string;
  progress: SyncProgress;
}

export interface SyncLog {
  id: number;
  endpoint_name: string;
  endpoint_key: string;
  sync_type: string;
  status: string;
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  duration_ms: number;
  error_message: string | null;
  synced_by: string;
  synced_at: string;
}

export interface RadiusStats {
  total_active: number;
  by_domain: Array<{
    domain: string;
    total: number;
  }>;
}

export interface SyncStartResult {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    processed: number;
    success: number;
    failed: number;
    mahasiswa: number;
    dosen: number;
    tendik: number;
    guest: number;
  };
  errors?: Array<{
    username: string;
    error: string;
  }>;
  status?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Sync Service for Radius to ManAkses
 */
export const syncService = {
  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const response = await authClient.get<ApiResponse<SyncStatus>>(
      '/manakses/sync/status'
    );
    return response.data.data;
  },

  /**
   * Get current sync progress
   */
  async getProgress(): Promise<{ progress: SyncProgress }> {
    const response = await authClient.get<ApiResponse<{ progress: SyncProgress }>>(
      '/manakses/sync/progress'
    );
    return response.data.data;
  },

  /**
   * Get sync logs history
   */
  async getLogs(limit: number = 10): Promise<{ logs: SyncLog[]; total: number }> {
    const response = await authClient.get<ApiResponse<{ logs: SyncLog[]; total: number }>>(
      '/manakses/sync/logs',
      { params: { limit } }
    );
    return response.data.data;
  },

  /**
   * Get Radius database statistics
   */
  async getRadiusStats(): Promise<RadiusStats> {
    const response = await authClient.get<ApiResponse<RadiusStats>>(
      '/manakses/sync/radius-stats'
    );
    return response.data.data;
  },

  /**
   * Start sync (foreground - blocking)
   */
  async startSync(options?: { username_filter?: string }): Promise<SyncStartResult> {
    const response = await authClient.post<ApiResponse<SyncStartResult>>(
      '/manakses/sync/start',
      options || {}
    );
    return response.data.data;
  },

  /**
   * Start sync in background (non-blocking via queue)
   */
  async startSyncBackground(options?: { username_filter?: string }): Promise<{ status: string; message: string }> {
    const response = await authClient.post<ApiResponse<{ status: string; message: string }>>(
      '/manakses/sync/start-background',
      options || {}
    );
    return response.data.data;
  },
};

export default syncService;
