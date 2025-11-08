/**
 * Publikasi Service
 * Service untuk mengambil data publikasi dosen
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

// API v1 base URL for sync endpoints (no auth required)
const API_V1_BASE = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/../api/v1`
  : 'http://localhost:9800/sister-service/api/v1';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

// Types
export interface PublikasiByJenis {
  jenis: string;
  jumlah: number;
}

export interface PublikasiByYear {
  tahun: number;
  jumlah: number;
}

export interface PublikasiByKategoriCapaian {
  kategori: string;
  jumlah: number;
}

export interface PublikasiByPeran {
  peran: string;
  jumlah: number;
}

export interface PublikasiByFakultas {
  fakultas: string;
  jumlah: number;
}

export interface PublikasiStatistics {
  total: number;
  by_jenis: PublikasiByJenis[];
  by_year: PublikasiByYear[];
  by_kategori_capaian: PublikasiByKategoriCapaian[];
  by_peran: PublikasiByPeran[];
  by_fakultas: PublikasiByFakultas[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const publikasiService = {
  async getStatistics(): Promise<PublikasiStatistics> {
    const response = await axios.get<ApiResponse<PublikasiStatistics>>(`${API_URL}/publikasi/statistics`);
    return response.data.data;
  },
};

// SISTER API Types
export interface PenulisInfo {
  nama: string;
  jenis_peran: string; // e.g., "Penulis (Dosen)", "Editor (Mahasiswa)"
}

export interface TulisPub {
  id_tulis_pub: string;
  id_publikasi: string;
  id_sdm?: string;
  id_katgiat?: number;
  id_pd?: string;
  id_orang?: string;
  urutan: number;
  afiliasi?: string;
  peran_tulis: string; // A/B/C/D
  jns_penulis: string; // 1/2/3
  a_corr_author: number;
  nm_pd?: string;
  nipd?: string;
}

export interface Publikasi {
  id_publikasi: string;
  id_jns_pub?: number;
  judul: string;
  tgl_terbit?: string;
  penerbit?: string;
  stat_impor_sinta?: number;
  last_sync?: string;
  jenis_publikasi_nama?: string;
  penulis?: PenulisInfo[];
}

export interface PublikasiStats {
  total_publikasi: number;
  total_jurnal_nasional: number;
  total_jurnal_intl: number;
  total_proseeding: number;
  total_buku: number;
}

export interface PublikasiListResult {
  data: Publikasi[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BatchAllSyncResult {
  total_dosen: number;
  total_success: number;
  total_failed: number;
  total_publikasi: number;
  duration: string;
  synced_by: string;
  failed_dosen?: string[];
}

/**
 * SISTER API Service for Publikasi Management
 */
export const sisterPublikasiService = {
  /**
   * Get publikasi statistics from SISTER API
   */
  async getStats(): Promise<PublikasiStats> {
    const response = await sisterClient.get<PublikasiStats>(
      '/publikasi/stats'
    );
    return response.data;
  },

  /**
   * Get paginated list of publikasi with search
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PublikasiListResult> {
    const response = await sisterClient.get<PublikasiListResult>(
      '/publikasi/list',
      { params }
    );
    return response.data;
  },

  /**
   * Trigger batch sync all publikasi from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await axios.post<BatchAllSyncResult>(
      `${API_V1_BASE}/publikasi/sync-all`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data;
  },

  /**
   * Get publikasi detail by id
   */
  async getDetail(idPublikasi: string): Promise<Publikasi> {
    const response = await sisterClient.get<Publikasi>(
      `/publikasi/${idPublikasi}`
    );
    return response.data;
  },

  /**
   * Get penulis by publikasi
   */
  async getPenulisByPublikasi(idPublikasi: string): Promise<TulisPub[]> {
    const response = await sisterClient.get<TulisPub[]>(
      `/publikasi/${idPublikasi}/penulis`
    );
    return response.data;
  },
};

/**
 * Helper functions
 */
export const publikasiHelpers = {
  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  getPeranTulisLabel(peranTulis: string): string {
    switch (peranTulis) {
      case 'A':
        return 'Penulis';
      case 'B':
        return 'Editor';
      case 'C':
        return 'Penerjemah';
      case 'D':
        return 'Penemu/Inventor';
      default:
        return 'Unknown';
    }
  },

  getJenisPenulisLabel(jnsPenulis: string): string {
    switch (jnsPenulis) {
      case '1':
        return 'Dosen';
      case '2':
        return 'Mahasiswa';
      case '3':
        return 'Profesional Mitra';
      default:
        return 'Unknown';
    }
  },

  getStatImporSintaLabel(statImporSinta: number): string {
    return statImporSinta === 1 ? 'SINTA' : 'Non-SINTA';
  },
};
