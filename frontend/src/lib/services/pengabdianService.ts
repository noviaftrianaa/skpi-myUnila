/**
 * Pengabdian Service
 * Service untuk mengambil data pengabdian dosen dari SISTER API
 */

import axios from 'axios';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083';

// Types - Reuse Litabmas type from penelitian since they share the same entity
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
  anggota?: AnggotaLitabmasInfo[]; // For list view
}

export interface PengabdianSyncResult {
  id_litabmas: string;
  id_sdm: string;
  nama?: string;
  judul: string;
  success: boolean;
  error?: string;
}

export interface BatchPengabdianSyncResult {
  total_processed: number;
  total_success: number;
  total_failed: number;
  duration: string;
  results: PengabdianSyncResult[];
  synced_by: string;
}

export interface PengabdianListResult {
  data: Litabmas[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PengabdianStats {
  total_penelitian: number; // Note: Backend uses same field name (it's actually total pengabdian)
  total_active: number;
  total_dana?: number;
  last_sync?: string;
}

/**
 * SISTER API Service for Pengabdian Management
 * Manages pengabdian data from SISTER Kemdikbud API
 */
export const sisterPengabdianService = {
  /**
   * Get list of pengabdian by id_sdm
   */
  async getListByIDSDM(idSDM: string): Promise<Litabmas[]> {
    const response = await axios.get<Litabmas[]>(
      `${SISTER_API_URL}/pengabdian`,
      { params: { id_sdm: idSDM } }
    );
    return response.data || [];
  },

  /**
   * Get pengabdian detail by id_litabmas
   */
  async getDetail(idLitabmas: string): Promise<Litabmas> {
    const response = await axios.get<Litabmas>(
      `${SISTER_API_URL}/litabmas/${idLitabmas}`
    );
    return response.data;
  },

  /**
   * Trigger sync pengabdian from SISTER API by id_sdm
   * @param idSDM - ID SDM dosen
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncByIDSDM(idSDM: string, syncedBy: string): Promise<BatchPengabdianSyncResult> {
    const response = await axios.post<BatchPengabdianSyncResult>(
      `${SISTER_API_URL}/../api/v1/pengabdian/sync`,
      null,
      { params: { id_sdm: idSDM, synced_by: syncedBy } }
    );
    return response.data;
  },

  /**
   * Get pengabdian statistics
   */
  async getStats(): Promise<PengabdianStats> {
    const response = await axios.get<PengabdianStats>(
      `${SISTER_API_URL}/pengabdian/stats`
    );
    return response.data;
  },

  /**
   * Get paginated list of pengabdian with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PengabdianListResult> {
    const response = await axios.get<{ success: boolean; data: PengabdianListResult }>(
      `${SISTER_API_URL}/pengabdian/list`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Trigger batch sync all pengabdian from SISTER API
   * This is not implemented in backend yet, but keeping for consistency
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchPengabdianSyncResult> {
    // Note: Backend doesn't have sync-all endpoint yet
    // This would need to be implemented if batch sync all is needed
    throw new Error('Sync all pengabdian is not implemented yet. Please sync per dosen.');
  },
};

/**
 * Helper functions
 */
export const pengabdianHelpers = {
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
   * Get total dana pengabdian
   */
  getTotalDana(pengabdian: Litabmas): number {
    return pengabdian.dana_dikti + pengabdian.dana_pt + pengabdian.dana_institusi_lain;
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
export const pengabdianService = sisterPengabdianService;

export default sisterPengabdianService;
