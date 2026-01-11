/**
 * Penelitian Service
 * Service untuk mengambil data penelitian dosen dari SISTER API
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

// Public API for penelitian detail
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

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

// Penelitian Detail Types (from public-service)
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

export interface PublikasiPenelitian {
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

export interface MahasiswaPenelitian {
  id_mhs_anggota_litabmas: string;
  id_pd: string;
  nama: string;
  nim: string;
  jenis_kelamin: string;
  prodi: string;
  jenjang: string;
  peran: string;
}

export interface PenelitianDetail {
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
  url_penelitian: string | null;
  anggota_tim: AnggotaTim[];
  publikasi: PublikasiPenelitian[];
  luaran_lainnya: LuaranLainnya[];
  mahasiswa: MahasiswaPenelitian[];
  statistics: {
    total_anggota_tim: number;
    total_publikasi: number;
    total_luaran_lainnya: number;
    total_mahasiswa: number;
  };
}

export interface PenelitianDetailResponse {
  success: boolean;
  message: string;
  data: PenelitianDetail | null;
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
      '/penelitian/sync',
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
   * This uses public-service API endpoint
   */
  async getStatistics(): Promise<PenelitianStatistics> {
    // Use native fetch to avoid axios interceptor issues
    const response = await fetch(
      `${PUBLIC_API_URL}/penelitian/statistics`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data; // Extract data from wrapper
  },

  /**
   * Get penelitian detail by ID
   * This uses public-service API endpoint
   */
  async getPenelitianDetail(idLitabmas: string): Promise<PenelitianDetailResponse> {
    const response = await axios.get<PenelitianDetailResponse>(
      `${PUBLIC_API_URL}/penelitian/${idLitabmas}`
    );
    return response.data;
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
    const response = await sisterClient.post<BatchAllSyncResult>(
      '/penelitian/sync-all',
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
