/**
 * Referensi Service
 * API client for Feeder Service - Referensi (Master Data) endpoints
 */

import { feederClient } from '@/lib/api/feederClient';
import type { FeederAPIResponse } from '@/lib/types/feederTypes';

/**
 * Referensi Item Interface (Generic for all reference data)
 */
export interface ReferensiItem {
  id: string;
  nama: string;
  kode?: string;
  keterangan?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_sync?: string;
}

/**
 * Referensi Stats Interface
 */
export interface ReferensiStats {
  endpoint_key: string;
  endpoint_name: string;
  total_records: number;
  last_sync?: string;
}

/**
 * All Referensi Stats Interface
 */
export interface AllReferensiStats {
  total_endpoints: number;
  total_records: number;
  synced_endpoints: number;
  referensi_list: ReferensiStats[];
}

/**
 * Sync Referensi Params
 */
export interface SyncReferensiParams {
  endpoint_keys: string[]; // Array of endpoint keys to sync (e.g., ["jalur_masuk", "semester"])
  force_sync?: boolean; // Optional: Force re-sync existing data
  synced_by: string; // User who initiated sync
}

/**
 * Batch Sync Result
 */
export interface BatchReferensiSyncResult {
  total_endpoints: number;
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  details: {
    endpoint_key: string;
    endpoint_name: string;
    status: 'success' | 'failed' | 'skipped';
    records: number;
    message?: string;
  }[];
  message: string;
}

/**
 * Available referensi endpoints
 */
export const REFERENSI_ENDPOINTS = [
  { key: 'jalur_masuk', name: 'Jalur Masuk', description: 'Data jalur masuk mahasiswa' },
  { key: 'jenis_evaluasi', name: 'Jenis Evaluasi', description: 'Data jenis evaluasi perkuliahan' },
  { key: 'jenis_pendaftaran', name: 'Jenis Pendaftaran', description: 'Data jenis pendaftaran mahasiswa' },
  { key: 'jenis_keluar', name: 'Jenis Keluar', description: 'Data jenis keluar mahasiswa' },
  { key: 'status_mahasiswa', name: 'Status Mahasiswa', description: 'Data status mahasiswa' },
  { key: 'tahun_ajaran', name: 'Tahun Ajaran', description: 'Data tahun ajaran' },
  { key: 'semester', name: 'Semester', description: 'Data semester' },
  { key: 'jenis_prestasi', name: 'Jenis Prestasi', description: 'Data jenis prestasi mahasiswa' },
  { key: 'tingkat_prestasi', name: 'Tingkat Prestasi', description: 'Data tingkat prestasi' },
  { key: 'kebutuhan_khusus', name: 'Kebutuhan Khusus', description: 'Data kebutuhan khusus mahasiswa' },
  { key: 'wilayah', name: 'Wilayah', description: 'Data wilayah' },
] as const;

/**
 * Get list of all referensi with stats
 */
export async function getAllReferensiStats(): Promise<FeederAPIResponse<AllReferensiStats>> {
  const response = await feederClient.get('/referensi/stats', {
    params: { _t: Date.now() } // Cache busting
  });
  return response.data;
}

/**
 * Get specific referensi data by endpoint key
 * @param endpointKey - The referensi endpoint key (e.g., "jalur_masuk", "semester")
 * @param params - Optional query parameters (page, limit, search)
 */
export async function getReferensiByKey(
  endpointKey: string,
  params?: { page?: number; limit?: number; search?: string }
): Promise<FeederAPIResponse<{ data: ReferensiItem[]; total: number; page: number; limit: number }>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.search) queryParams.search = params.search;

  const response = await feederClient.get(`/referensi/${endpointKey}`, { params: queryParams });
  return response.data;
}

/**
 * Get referensi stats for specific endpoint
 * @param endpointKey - The referensi endpoint key
 */
export async function getReferensiStats(
  endpointKey: string
): Promise<FeederAPIResponse<ReferensiStats>> {
  const response = await feederClient.get(`/referensi/${endpointKey}/stats`, {
    params: { _t: Date.now() } // Cache busting
  });
  return response.data;
}

/**
 * Sync referensi data from Neo Feeder
 * @param params - Sync parameters including endpoint keys to sync
 */
export async function syncReferensi(
  params: SyncReferensiParams
): Promise<FeederAPIResponse<BatchReferensiSyncResult>> {
  // Build request body
  const body = {
    endpoint_keys: params.endpoint_keys,
    synced_by: params.synced_by,
    force_sync: params.force_sync || false,
  };

  const response = await feederClient.post('/referensi/sync', body);
  return response.data;
}

/**
 * Sync single referensi endpoint
 * @param endpointKey - The referensi endpoint key to sync
 * @param syncedBy - User who initiated sync
 * @param forceSync - Force re-sync existing data
 */
export async function syncSingleReferensi(
  endpointKey: string,
  syncedBy: string,
  forceSync?: boolean
): Promise<FeederAPIResponse<{
  endpoint_key: string;
  endpoint_name: string;
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  message: string;
}>> {
  const queryParams = new URLSearchParams();
  queryParams.append('synced_by', syncedBy);
  if (forceSync) {
    queryParams.append('force_sync', 'true');
  }

  const response = await feederClient.post(
    `/referensi/${endpointKey}/sync?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Get available referensi endpoints
 */
export function getAvailableEndpoints() {
  return REFERENSI_ENDPOINTS;
}

/**
 * Find endpoint info by key
 */
export function findEndpointByKey(key: string) {
  return REFERENSI_ENDPOINTS.find(endpoint => endpoint.key === key);
}

// Export as object for consistency
export const referensiService = {
  getAllReferensiStats,
  getReferensiByKey,
  getReferensiStats,
  syncReferensi,
  syncSingleReferensi,
  getAvailableEndpoints,
  findEndpointByKey,
};

export default referensiService;
