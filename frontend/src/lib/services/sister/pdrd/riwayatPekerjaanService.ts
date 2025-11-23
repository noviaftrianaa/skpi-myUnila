/**
 * Riwayat Pekerjaan Service
 * Service untuk mengambil data riwayat pekerjaan dosen
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Types
export interface RiwayatPekerjaan {
  id_rwy_kerja: string;
  id_sdm: string;
  id_dudi?: string | null;
  id_pekerjaan?: number | null;
  id_kbli?: number | null;
  nm_jabatan: string;
  deskripsi_kerja?: string | null;
  instansi?: string | null;
  divisi?: string | null;
  mulai_bekerja: string;
  selesai_bekerja?: string | null;
  a_ln: number;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string | null;
  soft_delete: number;
  last_sync?: string | null;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  jenis_pekerjaan_name?: { String: string; Valid: boolean };
  bidang_usaha_name?: { String: string; Valid: boolean };
}

export interface RiwayatPekerjaanStats {
  total_riwayat: number;
  total_dalam_negeri: number;
  total_luar_negeri: number;
  last_sync_date?: string | null;
}

export interface RiwayatPekerjaanListResult {
  data: RiwayatPekerjaan[];
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
 * SISTER API Service for Riwayat Pekerjaan Management
 */
export const sisterRiwayatPekerjaanService = {
  /**
   * Get riwayat pekerjaan statistics from SISTER API
   */
  async getStats(): Promise<RiwayatPekerjaanStats> {
    const response = await sisterClient.get<{ success: boolean; data: RiwayatPekerjaanStats }>(
      '/riwayat-pekerjaan/stats'
    );
    return response.data.data;
  },

  /**
   * Get paginated list of riwayat pekerjaan with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: RiwayatPekerjaanListResult }> {
    const response = await sisterClient.get(
      '/riwayat-pekerjaan/list',
      { params }
    );
    return response.data;
  },

  /**
   * Trigger batch sync all riwayat pekerjaan from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await sisterClient.post<{ success: boolean; data: BatchAllSyncResult }>(
      '/riwayat-pekerjaan/sync-all',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get riwayat pekerjaan detail by id
   */
  async getDetail(idRwyKerja: string): Promise<RiwayatPekerjaan> {
    const response = await sisterClient.get<{ success: boolean; data: RiwayatPekerjaan }>(
      `/riwayat-pekerjaan/${idRwyKerja}`
    );
    return response.data.data;
  },
};

/**
 * Helper functions
 */
export const riwayatPekerjaanHelpers = {
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

  getJenisPekerjaan(jenisPekerjaan?: { String: string; Valid: boolean }): string {
    if (!jenisPekerjaan || !jenisPekerjaan.Valid) return '-';
    return jenisPekerjaan.String;
  },

  getLuarNegeriLabel(aLuarNegeri: number): string {
    return aLuarNegeri === 1 ? 'Luar Negeri' : 'Dalam Negeri';
  },

  getDuration(mulai: string, selesai?: string | null): string {
    if (!selesai) return 'Sekarang';

    const startDate = new Date(mulai);
    const endDate = new Date(selesai);
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth());

    if (diffMonths < 12) {
      return `${diffMonths} bulan`;
    }

    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (months === 0) {
      return `${years} tahun`;
    }

    return `${years} tahun ${months} bulan`;
  },
};
