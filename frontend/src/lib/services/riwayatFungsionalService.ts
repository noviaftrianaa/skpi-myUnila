/**
 * Riwayat Fungsional Service
 * Service untuk mengambil data riwayat jabatan fungsional dosen
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Types
export interface RiwayatFungsional {
  id_rwy_jabfung: string;
  id_sdm: string;
  id_kel_bidang?: number | null;
  id_jabfung: number;
  sk_jabfung: string;
  tmt_sk_jabfung: string;
  angka_kredit: number | null; // float from backend, can be null
  lebih_ajar: number | null;
  lebih_lit: number | null;
  lebih_pengmas: number | null;
  lebih_tunjang: number | null;
  bidang_ilmu?: string | null;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string | null;
  soft_delete: number;
  last_sync?: string | null;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  jabatan?: { String: string; Valid: boolean };
  kelompok_bidang?: { String: string; Valid: boolean };
}

export interface RiwayatFungsionalStats {
  total_riwayat: number;
  total_profesor: number;
  total_lektor_kepala: number;
  total_lektor: number;
  last_sync_date?: string | null;
}

export interface RiwayatFungsionalListResult {
  data: RiwayatFungsional[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BatchAllSyncResult {
  total_dosen: number;
  total_success: number;
  total_failed: number;
  duration: string;
  synced_by: string;
  failed_dosen?: string[];
}

/**
 * SISTER API Service for Riwayat Fungsional Management
 */
export const sisterRiwayatFungsionalService = {
  /**
   * Get riwayat fungsional statistics from SISTER API
   */
  async getStats(): Promise<RiwayatFungsionalStats> {
    const response = await sisterClient.get<{ success: boolean; data: RiwayatFungsionalStats }>(
      '/jabatan-fungsional/stats'
    );
    return response.data.data;
  },

  /**
   * Get paginated list of riwayat fungsional with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: RiwayatFungsionalListResult }> {
    const response = await sisterClient.get(
      '/jabatan-fungsional/list',
      { params }
    );
    return response.data;
  },

  /**
   * Trigger batch sync all riwayat fungsional from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await axios.post<{ success: boolean; data: BatchAllSyncResult }>(
      `${API_V1_BASE}/jabatan-fungsional/sync-all`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get riwayat fungsional detail by id
   */
  async getDetail(idRwyJabfung: string): Promise<RiwayatFungsional> {
    const response = await sisterClient.get<{ success: boolean; data: RiwayatFungsional }>(
      `/jabatan-fungsional/${idRwyJabfung}`
    );
    return response.data.data;
  },
};

/**
 * Helper functions
 */
export const riwayatFungsionalHelpers = {
  formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatMonth(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
    });
  },

  getDosenName(namaDosen?: { String: string; Valid: boolean }): string {
    if (!namaDosen || !namaDosen.Valid) return '-';
    return namaDosen.String;
  },

  getNIDN(nidn?: { String: string; Valid: boolean }): string {
    if (!nidn || !nidn.Valid) return '-';
    return nidn.String;
  },

  getJabatan(jabatan?: { String: string; Valid: boolean }): string {
    if (!jabatan || !jabatan.Valid) return '-';
    return jabatan.String;
  },

  getKelompokBidang(kelompokBidang?: { String: string; Valid: boolean }): string {
    if (!kelompokBidang || !kelompokBidang.Valid) return '-';
    return kelompokBidang.String;
  },

  getJabatanColor(jabatan: string): "danger" | "warning" | "primary" | "success" | "default" {
    const jabatanLower = jabatan.toLowerCase();
    if (jabatanLower.includes('profesor')) return 'danger';
    if (jabatanLower.includes('lektor kepala')) return 'warning';
    if (jabatanLower.includes('lektor')) return 'primary';
    if (jabatanLower.includes('asisten ahli')) return 'success';
    return 'default';
  },

  getTotalAngkaKredit(riwayat: RiwayatFungsional): number {
    return (
      (riwayat.angka_kredit || 0) +
      (riwayat.lebih_ajar || 0) +
      (riwayat.lebih_lit || 0) +
      (riwayat.lebih_pengmas || 0) +
      (riwayat.lebih_tunjang || 0)
    );
  },
};
