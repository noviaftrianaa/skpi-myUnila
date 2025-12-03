/**
 * SIKEP Referensi Service
 * Handles API calls for SIKEP referensi metadata and batch sync operations
 */

import { myunilaClient } from '@/lib/api/myunilaClient';

export interface SikepReferensiMetadata {
  key: string;
  name: string;
  description: string;
  total_records: number;
  last_sync: string | null;
  synced_by: string;
  available: boolean;
}

export interface SikepBatchSyncResult {
  endpoint: string;
  success: boolean;
  total_records: number;
  message: string;
  error?: string;
}

export interface SikepBatchSyncResponse {
  total_requested: number;
  total_success: number;
  total_failed: number;
  results: SikepBatchSyncResult[];
  duration: string;
}

export interface SikepPaginatedResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const sikepReferensiService = {
  /**
   * Get metadata for all SIKEP referensi endpoints
   */
  async getMetadata(): Promise<SikepReferensiMetadata[]> {
    try {
      const response = await myunilaClient.get('/sikep/referensi/metadata');
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching SIKEP referensi metadata:", error);
      throw error;
    }
  },

  /**
   * Batch sync multiple endpoints in parallel
   */
  async batchSync(endpoints: string[]): Promise<SikepBatchSyncResponse> {
    try {
      const response = await myunilaClient.post('/sikep/referensi/batch-sync', {
        endpoints: endpoints,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error batch syncing SIKEP referensi:", error);
      throw error;
    }
  },

  /**
   * Get data for a specific endpoint
   * Converts keys like golongan_pns to golongan-pns for URL
   */
  async getEndpointData(key: string): Promise<any[]> {
    try {
      // Convert underscore to hyphen for URL (e.g., golongan_pns -> golongan-pns)
      const urlKey = key.replace(/_/g, '-');
      const response = await myunilaClient.get(`/sikep/referensi/${urlKey}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching ${key} data:`, error);
      throw error;
    }
  },

  /**
   * Sync individual endpoint
   * Converts keys like golongan_pns to golongan-pns for URL
   */
  async syncEndpoint(key: string): Promise<any> {
    try {
      // Convert underscore to hyphen for URL (e.g., golongan_pns -> golongan-pns)
      const urlKey = key.replace(/_/g, '-');
      const response = await myunilaClient.post(`/sikep/referensi/${urlKey}/sync`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get paginated data for a specific endpoint
   * Uses the new /data/:key endpoint with pagination support
   */
  async getEndpointDataPaginated(
    key: string,
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<SikepPaginatedResponse> {
    try {
      // Convert underscore to hyphen for URL (e.g., golongan_pns -> golongan-pns)
      const urlKey = key.replace(/_/g, '-');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      const response = await myunilaClient.get(`/sikep/referensi/data/${urlKey}?${params.toString()}`);
      return {
        data: response.data.data || [],
        meta: response.data.meta || { total: 0, page: 1, limit: 10, total_pages: 0 },
      };
    } catch (error) {
      console.error(`Error fetching paginated ${key} data:`, error);
      throw error;
    }
  },
};
