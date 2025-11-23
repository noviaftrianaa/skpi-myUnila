/**
 * Aktivitas Mahasiswa Service
 * API client for Feeder Service - Aktivitas Mahasiswa endpoints
 */

import { feederClient } from '../api/feederClient';
import type {
  GetAktivitasListParams,
  SyncAktivitasParams,
  AktivitasListResult,
  AktivitasDetail,
  BatchAktivitasSyncResult,
  ProdiOption,
  FeederAPIResponse,
} from '../types/feederTypes';

/**
 * Get list of aktivitas mahasiswa (MANDATORY: id_semester)
 * @param params - Query parameters including mandatory id_semester (comma-separated)
 */
export async function getAktivitasList(
  params: GetAktivitasListParams
): Promise<FeederAPIResponse<AktivitasListResult>> {
  // Validate mandatory id_semester
  if (!params.id_semester || params.id_semester.trim() === '') {
    throw new Error('id_semester is required (minimum 1 semester)');
  }

  const response = await feederClient.get('/aktivitas-mahasiswa', { params });
  return response.data;
}

/**
 * Get aktivitas mahasiswa detail by ID
 * @param idAktMhs - ID Aktivitas Mahasiswa (UUID)
 */
export async function getAktivitasDetail(
  idAktMhs: string
): Promise<FeederAPIResponse<AktivitasDetail>> {
  const response = await feederClient.get(`/aktivitas-mahasiswa/${idAktMhs}`);
  return response.data;
}

/**
 * Sync aktivitas mahasiswa from Neo Feeder (MANDATORY: id_semester)
 * @param params - Sync parameters including mandatory id_semester
 */
export async function syncAktivitasMahasiswa(
  params: SyncAktivitasParams
): Promise<FeederAPIResponse<BatchAktivitasSyncResult>> {
  // Validate mandatory id_semester
  if (!params.id_semester || params.id_semester.trim() === '') {
    throw new Error('id_semester is required (minimum 1 semester)');
  }

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('id_semester', params.id_semester);
  queryParams.append('synced_by', params.synced_by);

  if (params.id_prodi) {
    queryParams.append('id_prodi', params.id_prodi);
  }

  if (params.force_sync) {
    queryParams.append('force_sync', 'true');
  }

  const response = await feederClient.post(
    `/aktivitas-mahasiswa/sync?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Get list of prodi (helper endpoint)
 */
export async function getProdiList(): Promise<FeederAPIResponse<ProdiOption[]>> {
  const response = await feederClient.get('/aktivitas-mahasiswa/helper/prodi');
  return response.data;
}

// Export as object for consistency
export const aktivitasMahasiswaService = {
  getAktivitasList,
  getAktivitasDetail,
  syncAktivitasMahasiswa,
  getProdiList,
};

export default aktivitasMahasiswaService;
