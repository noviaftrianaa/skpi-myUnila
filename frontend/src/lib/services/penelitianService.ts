/**
 * Penelitian Service
 * Service untuk mengambil data penelitian dosen dari SISTER API
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/../api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Types
export interface AnggotaLitabmasInfo {
  nama: string;
  jenis_peran: string; // "Dosen (Ketua)", "Mahasiswa (Anggota)", etc
}

export interface Litabmas {
  id_litabmas: string;
  id_lemb_iptek?: string;
  id_skim?: string;
  id_thn_usulan?: number;
  id_thn_kegiatan?: number;
  id_thn_laks?: number;
  id_lanjutan_litabmas?: string;
  id_kel_bidang?: string;
  id_tse?: number;
  id_smi?: string;
  id_jns_lit?: number;
  judul_litabmas: string;
  lama_kegiatan: number;
  thn_laks_ke?: number;
  dana_dikti: number;
  dana_pt: number;
  dana_institusi_lain: number;
  in_kind?: string;
  stat_aktif: number;
  jns_litabmas: string; // 'L' = Penelitian, 'M' = Pengabdian
  sk_tugas?: string;
  tgl_sk_tugas?: string;
  lokasi_kegiatan?: string;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string;
  soft_delete: number;
  last_sync?: string;
  id_sdm_ketua?: string; // ID SDM ketua penelitian (for sync)
  anggota?: AnggotaLitabmasInfo[]; // For list view
}

export interface PenelitianSyncResult {
  id_litabmas: string;
  id_sdm: string;
  nama?: string;
  judul: string;
  success: boolean;
  error?: string;
}

export interface BatchPenelitianSyncResult {
  total_processed: number;
  total_success: number;
  total_failed: number;
  duration: string;
  results: PenelitianSyncResult[];
  synced_by: string;
}

export interface PenelitianListResult {
  data: Litabmas[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PenelitianStats {
  total_penelitian: number;
  total_active: number;
  total_dana?: number;
  last_sync?: string;
}

export interface BatchAllSyncResult {
  total_dosen: number;
  total_success: number;
  total_failed: number;
  total_litabmas: number;
  duration: string;
  synced_by: string;
  failed_dosen?: string[];
}

// Alias untuk backward compatibility dengan dashboard
export interface PenelitianStatistics {
  total: number;
  by_kategori: Array<{
    kategori: string;
    jumlah: number;
  }>;
  by_year: Array<{
    tahun: number;
    jumlah: number;
  }>;
  by_funding: Array<{
    tahun: number;
    dana_dikti: number;
    dana_pt: number;
    dana_institusi_lain: number;
    total_dana: number;
  }>;
  by_kelompok_bidang: Array<{
    kelompok_bidang: string;
    jumlah: number;
  }>;
  by_fakultas: Array<{
    fakultas: string;
    jumlah: number;
  }>;
}

/**
 * SISTER API Service for Penelitian Management
 * Manages penelitian data from SISTER Kemdikbud API
 */
export const sisterPenelitianService = {
  /**
   * Get list of penelitian by id_sdm
   */
  async getListByIDSDM(idSDM: string): Promise<Litabmas[]> {
    const response = await sisterClient.get<Litabmas[]>(
      '/penelitian',
      { params: { id_sdm: idSDM } }
    );
    return response.data || [];
  },

  /**
   * Get penelitian detail by id_litabmas
   */
  async getDetail(idLitabmas: string): Promise<Litabmas> {
    const response = await sisterClient.get<Litabmas>(
      `/litabmas/${idLitabmas}`
    );
    return response.data;
  },

  /**
   * Trigger sync penelitian from SISTER API by id_sdm
   * @param idSDM - ID SDM dosen
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncByIDSDM(idSDM: string, syncedBy: string): Promise<BatchPenelitianSyncResult> {
    const response = await sisterClient.post<BatchPenelitianSyncResult>(
      '/api/v1/penelitian/sync',
      null,
      { params: { id_sdm: idSDM, synced_by: syncedBy } }
    );
    return response.data;
  },

  /**
   * Get penelitian statistics
   */
  async getStats(): Promise<PenelitianStats> {
    const response = await sisterClient.get<PenelitianStats>(
      '/penelitian/stats'
    );
    return response.data;
  },

  /**
   * Get penelitian statistics for dashboard (with sebaran fakultas/prodi)
   * This uses dashboard-service API endpoint
   */
  async getStatistics(): Promise<PenelitianStatistics> {
    // Use native fetch to avoid axios interceptor issues
    const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';
    const response = await fetch(
      `${DASHBOARD_API_URL}/penelitian/statistics`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data; // Extract data from wrapper
  },

  /**
   * Get paginated list of penelitian with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PenelitianListResult> {
    const response = await sisterClient.get<{ success: boolean; data: PenelitianListResult }>(
      '/penelitian/list',
      { params }
    );
    return response.data.data;
  },

  /**
   * Trigger batch sync all penelitian from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await axios.post<BatchAllSyncResult>(
      `${API_V1_BASE}/penelitian/sync-all`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data;
  },
};

/**
 * Helper functions
 */
export const penelitianHelpers = {
  /**
   * Format date untuk display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format currency (IDR)
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Get total dana penelitian
   */
  getTotalDana(penelitian: Litabmas): number {
    return penelitian.dana_dikti + penelitian.dana_pt + penelitian.dana_institusi_lain;
  },

  /**
   * Get status aktif label
   */
  getStatusAktifLabel(statAktif: number): string {
    return statAktif === 1 ? 'Aktif' : 'Tidak Aktif';
  },

  /**
   * Get jenis litabmas label
   */
  getJenisLitabmasLabel(jnsLitabmas: string): string {
    return jnsLitabmas === 'L' ? 'Penelitian' : 'Pengabdian';
  },
};

// Alias untuk backward compatibility
export const penelitianService = sisterPenelitianService;

export default sisterPenelitianService;
