/**
 * Kurikulum Service
 * API client for Feeder Service - Kurikulum endpoints
 */

import { feederClient } from '@/lib/api/feederClient';
import type {
  GetKurikulumListParams,
  SyncKurikulumParams,
  KurikulumListResult,
  KurikulumDetail,
  BatchKurikulumSyncResult,
  KurikulumStats,
  ProdiOption,
  FeederAPIResponse,
} from '@/lib/types/feederTypes';

/**
 * Get list of kurikulum (OPTIONAL: id_prodi filter)
 * @param params - Query parameters
 */
export async function getKurikulumList(
  params: GetKurikulumListParams
): Promise<FeederAPIResponse<KurikulumListResult>> {
  const response = await feederClient.get('/kurikulum', { params });
  return response.data;
}

/**
 * Get kurikulum detail by ID
 * @param idKurikulumSP - ID Kurikulum SP (UUID)
 */
export async function getKurikulumDetail(
  idKurikulumSP: string
): Promise<FeederAPIResponse<KurikulumDetail>> {
  const response = await feederClient.get(`/kurikulum/${idKurikulumSP}`);
  return response.data;
}

/**
 * Get kurikulum statistics
 */
export async function getKurikulumStats(): Promise<FeederAPIResponse<KurikulumStats>> {
  const response = await feederClient.get('/kurikulum/stats');
  return response.data;
}

/**
 * Sync kurikulum from Neo Feeder (OPTIONAL: id_prodi)
 * @param params - Sync parameters with optional id_prodi filter
 */
export async function syncKurikulum(
  params: SyncKurikulumParams
): Promise<FeederAPIResponse<BatchKurikulumSyncResult>> {
  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('synced_by', params.synced_by);

  // Only add id_prodi to query if it exists
  if (params.id_prodi && params.id_prodi.trim() !== '') {
    queryParams.append('id_prodi', params.id_prodi);
  }

  const response = await feederClient.post(
    `/kurikulum/sync?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Get list of prodi (helper endpoint)
 */
export async function getProdiList(): Promise<FeederAPIResponse<ProdiOption[]>> {
  const response = await feederClient.get('/kurikulum/prodi');
  return response.data;
}

// Export as object for consistency
export const kurikulumService = {
  getKurikulumList,
  getKurikulumDetail,
  getKurikulumStats,
  syncKurikulum,
  getProdiList,
};

export default kurikulumService;
