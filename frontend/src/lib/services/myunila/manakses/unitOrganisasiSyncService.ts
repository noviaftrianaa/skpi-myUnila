/**
 * Unit Organisasi Sync Service
 * Service untuk sinkronisasi data pdrd.sms ke man_akses.unit_organisasi
 * Menggunakan myunila-service (myunilaClient)
 */

import { myunilaClient } from '@/lib/api/myunilaClient';

// Types
export interface UnitOrganisasiSyncStats {
  total_unit_organisasi: number;
  total_sms: number;
  total_synced: number;
  total_not_synced: number;
  last_sync: string | null;
}

export interface UnitOrganisasiItem {
  id_organisasi: string;
  nm_lemb: string;
  ds_kel: string;
  kode_pos: string | null;
  no_tel: string | null;
  email: string | null;
  a_aktif: number;
  last_sync: string | null;
}

export interface ComparisonItem {
  id_sms: string;
  nm_lemb_sms: string;
  exists_in_manakses: boolean;
  nm_lemb_manakses?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SyncResult {
  total_processed: number;
  total_inserted: number;
  total_updated: number;
  total_failed: number;
  duration: string;
  synced_by: string;
}

export const unitOrganisasiSyncService = {
  /**
   * Get statistics for dashboard
   */
  async getStats(): Promise<UnitOrganisasiSyncStats> {
    try {
      const response = await myunilaClient.get('/manakses/unit-organisasi/stats');
      return response.data.data;
    } catch (error) {
      console.error("Error fetching unit organisasi stats:", error);
      throw error;
    }
  },

  /**
   * Get SMS list (source data from pdrd.sms)
   */
  async getSMSList(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<PaginatedResponse<UnitOrganisasiItem>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      const response = await myunilaClient.get(`/manakses/unit-organisasi/sms?${params.toString()}`);
      return {
        data: response.data.data || [],
        meta: response.data.meta || { total: 0, page: 1, limit: 10, total_pages: 0 },
      };
    } catch (error) {
      console.error("Error fetching SMS list:", error);
      throw error;
    }
  },

  /**
   * Get unit organisasi list (target data in man_akses.unit_organisasi)
   */
  async getUnitOrganisasiList(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<PaginatedResponse<UnitOrganisasiItem>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      const response = await myunilaClient.get(`/manakses/unit-organisasi?${params.toString()}`);
      return {
        data: response.data.data || [],
        meta: response.data.meta || { total: 0, page: 1, limit: 10, total_pages: 0 },
      };
    } catch (error) {
      console.error("Error fetching unit organisasi list:", error);
      throw error;
    }
  },

  /**
   * Get comparison list
   */
  async getComparisonList(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    filter: 'all' | 'synced' | 'not_synced' = 'all'
  ): Promise<PaginatedResponse<ComparisonItem>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      if (filter !== 'all') {
        params.append('filter', filter);
      }
      const response = await myunilaClient.get(`/manakses/unit-organisasi/comparison?${params.toString()}`);
      return {
        data: response.data.data || [],
        meta: response.data.meta || { total: 0, page: 1, limit: 10, total_pages: 0 },
      };
    } catch (error) {
      console.error("Error fetching comparison list:", error);
      throw error;
    }
  },

  /**
   * Sync data from pdrd.sms to man_akses.unit_organisasi
   * Uses extended timeout (5 minutes) for sync operations
   */
  async syncFromSMS(syncedBy: string = 'system'): Promise<SyncResult> {
    try {
      const response = await myunilaClient.post(
        `/manakses/unit-organisasi/sync?synced_by=${encodeURIComponent(syncedBy)}`,
        {},
        { timeout: 300000 } // 5 minutes timeout for sync operations
      );
      return response.data.data;
    } catch (error) {
      console.error("Error syncing from SMS:", error);
      throw error;
    }
  },
};

export default unitOrganisasiSyncService;
