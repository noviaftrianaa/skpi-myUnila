/**
 * Pendidikan Formal Service
 * Service untuk mengambil data pendidikan formal dosen
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Types
export interface PendidikanFormal {
  id_rwy_didik_formal: string;
  id_sms?: string | null;
  id_katgiat: number;
  id_sdm: string;
  id_jenj_didik?: number | null;
  id_bid_studi?: number | null;
  id_gelar_akad?: number | null;
  nm_sp_formal?: string | null;
  fak?: string | null;
  a_kependidikan: number;
  thn_masuk?: number | null;
  thn_lulus?: number | null;
  nipd?: string | null;
  stat_kul: string;
  smt?: number | null;
  sks_lulus?: number | null;
  ipk?: number | null;
  sk_setara?: string | null;
  tgl_sk_setara?: string | null;
  no_ijazah?: string | null;
  judul_tesis?: string | null;
  tgl_lulus?: string | null;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string | null;
  soft_delete: number;
  last_sync?: string | null;
  jenjang_pendidikan_nama?: string | null;
  bidang_studi_nama?: string | null;
  gelar_akademik_nama?: string | null;
  nama_program_studi?: string | null;
  nama_dosen?: string | null;
}

export interface PendidikanFormalStats {
  total_pendidikan_formal: number;
  total_s1: number;
  total_s2: number;
  total_s3: number;
  last_sync?: string | null;
}

export interface PendidikanFormalListResult {
  data: PendidikanFormal[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BatchAllSyncResult {
  total_dosen: number;
  total_success: number;
  total_failed: number;
  total_pendidikan_formal: number;
  duration: string;
  synced_by: string;
  failed_dosen?: string[];
}

/**
 * SISTER API Service for Pendidikan Formal Management
 */
export const sisterPendidikanService = {
  /**
   * Get pendidikan formal statistics from SISTER API
   */
  async getStats(): Promise<PendidikanFormalStats> {
    const response = await sisterClient.get<PendidikanFormalStats>(
      '/pendidikan-formal/stats'
    );
    return response.data;
  },

  /**
   * Get paginated list of pendidikan formal with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message: string; data: PendidikanFormalListResult }> {
    const response = await sisterClient.get(
      '/pendidikan-formal/list',
      { params }
    );
    return response.data;
  },

  /**
   * Trigger batch sync all pendidikan formal from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await axios.post<BatchAllSyncResult>(
      `${API_V1_BASE}/pendidikan-formal/sync-all`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data;
  },

  /**
   * Get pendidikan formal detail by id
   */
  async getDetail(idRwyDidikFormal: string): Promise<PendidikanFormal> {
    const response = await sisterClient.get<PendidikanFormal>(
      `/pendidikan-formal/${idRwyDidikFormal}`
    );
    return response.data;
  },
};

/**
 * Helper functions
 */
export const pendidikanHelpers = {
  formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatYear(tahun?: number | null): string {
    if (!tahun || tahun === 0) return '-';
    return tahun.toString();
  },

  getStatusKuliahLabel(statKul: string): string {
    switch (statKul) {
      case 'L':
        return 'Lulus';
      case '1':
        return 'Sedang Studi';
      default:
        return 'Unknown';
    }
  },
};
