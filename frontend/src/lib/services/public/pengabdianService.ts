/**
 * Pengabdian Service
 * Service untuk mengambil data pengabdian dosen dari SISTER API
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Dashboard API for pengabdian detail
const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
  ? `${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/public/api/v1`
  : 'http://localhost:9800/dashboard-service/public/api/v1';

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
  id_sdm_ketua?: string; // ID SDM ketua pengabdian (for sync)
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

export interface BatchAllSyncResult {
  total_dosen: number;
  total_success: number;
  total_failed: number;
  total_litabmas: number;
  duration: string;
  synced_by: string;
  failed_dosen?: string[];
}

// Pengabdian Detail Types (from dashboard-service)
export interface AnggotaTim {
  id_sdm_anggota_litabmas: string;
  id_sdm: string;
  nama: string;
  nidn: string;
  nuptk: string;
  jenis_kelamin: string;
  jabatan_fungsional: string;
  prodi: string;
  jenjang: string;
  peran: string;
  urutan: number;
}

export interface PublikasiPengabdian {
  id_publikasi: string;
  judul: string;
  tahun: number;
  tanggal_terbit: string;
  jenis_publikasi: string;
  penerbit: string;
  issn: string | null;
  volume: string | null;
  nomor: string | null;
  halaman: string | null;
  url_publikasi: string | null;
}

export interface LuaranLainnya {
  id_luaran_lainnya: string;
  judul: string;
  tahun: number;
  jenis_luaran: string;
  keterangan: string | null;
  tautan: string | null;
}

export interface MahasiswaPengabdian {
  id_mhs_anggota_litabmas: string;
  id_pd: string;
  nama: string;
  nim: string;
  jenis_kelamin: string;
  prodi: string;
  jenjang: string;
  peran: string;
}

export interface PengabdianDetail {
  id_litabmas: string;
  judul: string;
  tahun: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lama_kegiatan: number;
  biaya: number;
  dana_dikti?: number;
  dana_pt?: number;
  dana_institusi_lain?: number;
  skim: string;
  lokasi_kegiatan: string | null;
  bidang_ilmu: string;
  sumber_dana: string;
  abstrak: string | null;
  kata_kunci: string | null;
  url_pengabdian: string | null;
  anggota_tim: AnggotaTim[];
  publikasi: PublikasiPengabdian[];
  luaran_lainnya: LuaranLainnya[];
  mahasiswa: MahasiswaPengabdian[];
  statistics: {
    total_anggota_tim: number;
    total_publikasi: number;
    total_luaran_lainnya: number;
    total_mahasiswa: number;
  };
}

export interface PengabdianDetailResponse {
  success: boolean;
  message: string;
  data: PengabdianDetail | null;
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
    const response = await sisterClient.get<Litabmas[]>(
      '/pengabdian',
      { params: { id_sdm: idSDM } }
    );
    return response.data || [];
  },

  /**
   * Get pengabdian detail by id_litabmas
   */
  async getDetail(idLitabmas: string): Promise<Litabmas> {
    const response = await sisterClient.get<Litabmas>(
      `/litabmas/${idLitabmas}`
    );
    return response.data;
  },

  /**
   * Trigger sync pengabdian from SISTER API by id_sdm
   * @param idSDM - ID SDM dosen
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncByIDSDM(idSDM: string, syncedBy: string): Promise<BatchPengabdianSyncResult> {
    const response = await sisterClient.post<BatchPengabdianSyncResult>(
      '/pengabdian/sync',
      null,
      { params: { id_sdm: idSDM, synced_by: syncedBy } }
    );
    return response.data;
  },

  /**
   * Get pengabdian statistics
   */
  async getStats(): Promise<PengabdianStats> {
    const response = await sisterClient.get<PengabdianStats>(
      '/pengabdian/stats'
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
    const response = await sisterClient.get<{ success: boolean; data: PengabdianListResult }>(
      '/pengabdian/list',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get pengabdian detail by ID
   * This uses dashboard-service API endpoint
   */
  async getPengabdianDetail(idLitabmas: string): Promise<PengabdianDetailResponse> {
    const response = await axios.get<PengabdianDetailResponse>(
      `${DASHBOARD_API_URL}/pengabdian/${idLitabmas}`
    );
    return response.data;
  },

  /**
   * Trigger batch sync all pengabdian from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await sisterClient.post<BatchAllSyncResult>(
      '/pengabdian/sync-all',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data;
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
