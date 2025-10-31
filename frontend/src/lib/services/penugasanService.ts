/**
 * Penugasan Service
 * Service untuk mengambil data penugasan/penempatan dosen
 */

import axios from 'axios';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083';

// Types
export interface KeaktifanPTK {
  id_keaktifan_ptk: string;
  id_reg_ptk: string;
  id_thn_ajaran: string;
  a_sp_homebase: number;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string;
  soft_delete: number;
}

export interface Penugasan {
  id_reg_ptk: string;
  id_sdm: string;
  id_sp: string;
  id_stat_pegawai: number;
  id_ikatan_kerja: string;
  id_sms: string;
  id_jns_keluar?: string;
  no_srt_tgs?: string;
  tgl_srt_tgs?: string;
  tmt_srt_tgs?: string;
  tgl_ptk_keluar?: string;
  nidn?: string;
  jns_reg?: string;
  create_date: string;
  id_creator: string;
  last_update: string;
  id_updater?: string;
  soft_delete: number;
  last_sync?: string;
}

export interface PenugasanSyncResult {
  id_reg_ptk: string;
  id_sdm: string;
  nama?: string;
  success: boolean;
  error?: string;
}

export interface BatchPenugasanSyncResult {
  total_processed: number;
  total_success: number;
  total_failed: number;
  duration: string;
  results: PenugasanSyncResult[];
  synced_by: string;
}

export interface PenugasanListResult {
  data: Penugasan[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PenugasanStats {
  total_penugasan: number;
  total_active: number;
  last_sync?: string;
}

// SISTER API Response wrapper
interface SisterApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * SISTER API Service for Penugasan Management
 * Manages penugasan/penempatan data from SISTER Kemdikbud API
 */
export const sisterPenugasanService = {
  /**
   * Get list of penugasan by id_sdm
   */
  async getListByIDSDM(idSDM: string): Promise<Penugasan[]> {
    const response = await axios.get<SisterApiResponse<Penugasan[]>>(
      `${SISTER_API_URL}/api/v1/penugasan`,
      { params: { id_sdm: idSDM } }
    );
    return response.data.data || [];
  },

  /**
   * Get penugasan detail by id_reg_ptk
   */
  async getDetail(idRegPTK: string): Promise<Penugasan> {
    const response = await axios.get<SisterApiResponse<Penugasan>>(
      `${SISTER_API_URL}/api/v1/penugasan/${idRegPTK}`
    );
    return response.data.data;
  },

  /**
   * Trigger sync penugasan from SISTER API by id_sdm
   * @param idSDM - ID SDM dosen
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncByIDSDM(idSDM: string, syncedBy: string): Promise<BatchPenugasanSyncResult> {
    const response = await axios.post<SisterApiResponse<BatchPenugasanSyncResult>>(
      `${SISTER_API_URL}/api/v1/penugasan/sync`,
      null,
      { params: { id_sdm: idSDM, synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get paginated list of penugasan with search
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 10)
   * @param search - Search query (NIDN, NIP, Nama, No Surat)
   */
  async getList(page: number = 1, limit: number = 10, search: string = ''): Promise<PenugasanListResult> {
    const response = await axios.get<SisterApiResponse<PenugasanListResult>>(
      `${SISTER_API_URL}/public/penugasan`,
      { params: { page, limit, search } }
    );
    return response.data.data;
  },

  /**
   * Get penugasan statistics
   */
  async getStats(): Promise<PenugasanStats> {
    const response = await axios.get<SisterApiResponse<PenugasanStats>>(
      `${SISTER_API_URL}/public/penugasan/stats`
    );
    return response.data.data;
  },
};

/**
 * Helper functions
 */
export const penugasanHelpers = {
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
   * Format status homebase
   */
  formatHomebase(homebase: number): string {
    return homebase === 1 ? 'Homebase' : 'Bukan Homebase';
  },

  /**
   * Get status kepegawaian label
   */
  getStatusKepegawaianLabel(idStatPegawai: number): string {
    const statusMap: Record<number, string> = {
      1: 'PNS',
      2: 'CPNS',
      3: 'Kontrak',
      4: 'Honorer',
    };
    return statusMap[idStatPegawai] || 'Tidak Diketahui';
  },

  /**
   * Get ikatan kerja label
   */
  getIkatanKerjaLabel(idIkatanKerja: string): string {
    const ikatanMap: Record<string, string> = {
      '1': 'Tetap',
      '2': 'Kontrak',
      '3': 'Tidak Tetap',
    };
    return ikatanMap[idIkatanKerja] || 'Tidak Diketahui';
  },
};
