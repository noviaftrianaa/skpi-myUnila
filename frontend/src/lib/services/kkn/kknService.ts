import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface TableStat {
  table: string;
  count: number;
}

export interface KKNStats {
  total_tables: number;
  total_rows: number;
  table_stats: TableStat[];
  last_sync: string | null;
  sqlserver_stats: TableStat[];
}

export interface SyncResult {
  table: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  duration_ms: number;
}

export interface SyncAllResult {
  results: SyncResult[];
  duration_ms: number;
  synced_by: string;
}

export interface SyncGroup {
  group: string;
  tables: string[];
  count: number;
}

// ============ Service ============

const kknService = {
  async getStats(): Promise<{ success: boolean; data: KKNStats }> {
    const response = await myunilaClient.get('/kkn/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getGroups(): Promise<{ success: boolean; data: SyncGroup[] }> {
    const response = await myunilaClient.get('/kkn/groups');
    return response.data;
  },

  async syncGroup(group: string, syncedBy?: string): Promise<{ success: boolean; data: SyncResult }> {
    const response = await myunilaClient.post(`/kkn/sync/${group}`, null, {
      headers: { 'X-User-ID': syncedBy || 'system' },
      timeout: 1800000,
    });
    return response.data;
  },

  async syncAll(syncedBy?: string): Promise<{ success: boolean; data: SyncAllResult; summary: Record<string, number> }> {
    const response = await myunilaClient.post('/kkn/sync-all', null, {
      headers: { 'X-User-ID': syncedBy || 'system' },
      timeout: 3600000,
    });
    return response.data;
  },
};

export default kknService;
