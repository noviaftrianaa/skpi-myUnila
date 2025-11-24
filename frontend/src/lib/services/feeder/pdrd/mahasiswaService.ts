/**
 * Mahasiswa Service
 * API client for Feeder Service - Mahasiswa endpoints
 */

import { feederClient } from '@/lib/api/feederClient';
import type { FeederAPIResponse } from '@/lib/types/feederTypes';

/**
 * Mahasiswa List Item Interface
 */
export interface MahasiswaListItem {
  id_pd: string;
  nama: string;
  npm: string | null;
  angkatan: string | null;
  jalur_masuk: string | null;
  jenis_pendaftaran: string | null;
  semester_sekarang: number | null;
  ipk: number | null;
  total_sks: number | null;
  status_mahasiswa: string | null;
  jenis_keluar: string | null;
  last_sync: string | null;
  id_prodi: string | null;
  nama_prodi: string | null;
  nama_jenjang: string | null;
}

/**
 * Mahasiswa Detail Interface
 */
export interface MahasiswaDetail extends MahasiswaListItem {
  nik: string | null;
  nisn: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kode_pos: string | null;
  telepon: string | null;
  handphone: string | null;
  email: string | null;
  nama_ayah: string | null;
  tanggal_lahir_ayah: string | null;
  pendidikan_ayah: string | null;
  pekerjaan_ayah: string | null;
  penghasilan_ayah: string | null;
  nama_ibu: string | null;
  tanggal_lahir_ibu: string | null;
  pendidikan_ibu: string | null;
  pekerjaan_ibu: string | null;
  penghasilan_ibu: string | null;
}

/**
 * Mahasiswa Stats Interface
 */
export interface MahasiswaStats {
  total_mahasiswa: number;
  total_aktif: number;
  total_tidak_aktif: number;
  last_sync?: string;
}

/**
 * Get Mahasiswa List Params
 */
export interface GetMahasiswaListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_prodi?: string;
  angkatan?: string[];
  status_mahasiswa?: string;
}

/**
 * Sync Mahasiswa Params
 */
export interface SyncMahasiswaParams {
  angkatan: string; // Comma-separated angkatan (e.g., "2020,2021,2022")
  id_prodi?: string; // Optional: Filter by prodi
  force_sync?: boolean; // Optional: Force re-sync existing data
  synced_by: string; // User who initiated sync
}

/**
 * Mahasiswa List Result
 */
export interface MahasiswaListResult {
  data: MahasiswaListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Batch Sync Result
 */
export interface BatchMahasiswaSyncResult {
  total_records: number;
  inserted_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  message: string;
}

/**
 * Prodi Option Interface
 */
export interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
  nm_jenj_didik: string;
}

/**
 * Angkatan Option Interface
 */
export interface AngkatanOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Get list of mahasiswa
 * @param params - Query parameters for filtering
 */
export async function getMahasiswaList(
  params: GetMahasiswaListParams
): Promise<FeederAPIResponse<MahasiswaListResult>> {
  const queryParams: Record<string, string> = {};

  if (params.page) queryParams.page = params.page.toString();
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.search) queryParams.search = params.search;
  if (params.id_prodi) queryParams.id_prodi = params.id_prodi;
  if (params.angkatan && params.angkatan.length > 0) {
    queryParams.angkatan = params.angkatan.join(',');
  }
  if (params.status_mahasiswa) queryParams.status_mahasiswa = params.status_mahasiswa;

  const response = await feederClient.get('/mahasiswa', { params: queryParams });
  return response.data;
}

/**
 * Get mahasiswa detail by ID
 * @param idPd - ID Mahasiswa (id_pd)
 */
export async function getMahasiswaDetail(
  idPd: string
): Promise<FeederAPIResponse<MahasiswaDetail>> {
  const response = await feederClient.get(`/mahasiswa/${idPd}`);
  return response.data;
}

/**
 * Get mahasiswa statistics
 */
export async function getMahasiswaStats(): Promise<FeederAPIResponse<MahasiswaStats>> {
  const response = await feederClient.get('/mahasiswa/stats', {
    params: { _t: Date.now() } // Cache busting
  });
  return response.data;
}

/**
 * Sync mahasiswa from Neo Feeder (MANDATORY: angkatan)
 * @param params - Sync parameters including mandatory angkatan
 */
export async function syncMahasiswa(
  params: SyncMahasiswaParams
): Promise<FeederAPIResponse<BatchMahasiswaSyncResult>> {
  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('angkatan', params.angkatan);
  queryParams.append('synced_by', params.synced_by);

  if (params.id_prodi) {
    queryParams.append('id_prodi', params.id_prodi);
  }

  if (params.force_sync) {
    queryParams.append('force_sync', 'true');
  }

  const response = await feederClient.post(
    `/mahasiswa/sync?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Get list of prodi (helper endpoint)
 */
export async function getProdiList(): Promise<FeederAPIResponse<ProdiOption[]>> {
  const response = await feederClient.get('/mahasiswa/helper/prodi');
  return response.data;
}

/**
 * Get list of angkatan with count (helper endpoint)
 */
export async function getAngkatanList(): Promise<FeederAPIResponse<AngkatanOption[]>> {
  const response = await feederClient.get('/mahasiswa/helper/angkatan');
  return response.data;
}

// Export as object for consistency
export const mahasiswaService = {
  getMahasiswaList,
  getMahasiswaDetail,
  getMahasiswaStats,
  syncMahasiswa,
  getProdiList,
  getAngkatanList,
};

export default mahasiswaService;
