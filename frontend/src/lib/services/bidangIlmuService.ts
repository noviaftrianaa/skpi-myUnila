/**
 * Bidang Ilmu Service
 * Service untuk mengambil dan sync data bidang ilmu dosen
 */

import { sisterClient } from '@/lib/api/sisterClient';

// Types
export interface BidangIlmuItem {
  id_sdm: string;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  id_kel_bidang: string;
  kode_bidang?: { String: string; Valid: boolean };
  nama_bidang?: { String: string; Valid: boolean };
  urutan: number;
  last_sync: string;
}

export interface BidangIlmuStats {
  total_dosen: number;
  total_bidang_ilmu: number;
  last_sync_date?: { Time: string; Valid: boolean } | null;
}

export interface BidangIlmuListResult {
  data: BidangIlmuItem[];
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

export const sisterBidangIlmuService = {
  async getStats(): Promise<BidangIlmuStats> {
    const response = await sisterClient.get<{ success: boolean; data: BidangIlmuStats }>(
      '/bidang-ilmu/stats'
    );
    return response.data.data;
  },

  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: BidangIlmuListResult }> {
    const response = await sisterClient.get(
      '/bidang-ilmu/list',
      { params }
    );
    return response.data;
  },

  async getByDosenID(idSDM: string): Promise<BidangIlmuItem[]> {
    const response = await sisterClient.get<{ success: boolean; data: BidangIlmuItem[] }>(
      `/bidang-ilmu/dosen/${idSDM}`
    );
    return response.data.data;
  },

  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await sisterClient.post<{ success: boolean; data: BatchAllSyncResult }>(
      '/api/v1/bidang-ilmu/sync-all',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  async syncSingleDosen(idSDM: string, syncedBy: string): Promise<any> {
    const response = await sisterClient.post<{ success: boolean; data: any }>(
      `/api/v1/bidang-ilmu/sync/${idSDM}`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },
};

export const bidangIlmuHelpers = {
  formatDate(dateField?: { Time: string; Valid: boolean } | null): string {
    if (!dateField || !dateField.Valid) return '-';
    return new Date(dateField.Time).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';

      const dateStr = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dateStr}, ${timeStr}`;
    } catch {
      return '-';
    }
  },

  getDosenName(namaDosen?: { String: string; Valid: boolean }): string {
    if (!namaDosen || !namaDosen.Valid) return '-';
    return namaDosen.String;
  },

  getNIDN(nidn?: { String: string; Valid: boolean }): string {
    if (!nidn || !nidn.Valid) return '-';
    return nidn.String;
  },

  getKodeBidang(kodeBidang?: { String: string; Valid: boolean }): string {
    if (!kodeBidang || !kodeBidang.Valid) return '-';
    return kodeBidang.String;
  },

  getNamaBidang(namaBidang?: { String: string; Valid: boolean }): string {
    if (!namaBidang || !namaBidang.Valid) return '-';
    return namaBidang.String;
  },

  getFullBidangName(
    kodeBidang?: { String: string; Valid: boolean },
    namaBidang?: { String: string; Valid: boolean }
  ): string {
    const kode = this.getKodeBidang(kodeBidang);
    const nama = this.getNamaBidang(namaBidang);

    if (kode === '-' && nama === '-') return '-';
    if (kode === '-') return nama;
    if (nama === '-') return kode;

    return `${kode} - ${nama}`;
  },
};

// Public Dashboard API
const API_BASE_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api';

export interface BidangIlmuSearchItem {
  id_kel_bidang: string;
  kode_kel_bidang: string;
  nm_kel_bidang: string;
  ket_kel_bidang: string | null;
  total_dosen: number;
}

export interface BidangIlmuSearchResponse {
  success: boolean;
  message: string;
  data: BidangIlmuSearchItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface DosenItem {
  id_sdm: string;
  encrypted_id: string;
  nama: string;
  nidn: string;
  nuptk: string;
  jenis_kelamin: string;
  jabatan_fungsional: string;
  prodi: string;
  jenjang: string;
  urutan: number;
}

export interface BidangIlmuDetail {
  id_kel_bidang: string;
  kode_kel_bidang: string;
  nm_kel_bidang: string;
  ket_kel_bidang: string | null;
  kat_kel: string | null;
  induk_bidang: string | null;
  dosen: DosenItem[];
  statistics: {
    total_dosen: number;
  };
}

export interface BidangIlmuDetailResponse {
  success: boolean;
  message: string;
  data: BidangIlmuDetail;
}

/**
 * Search bidang ilmu for public dashboard
 */
export async function searchBidangIlmu(
  search: string = '',
  page: number = 1,
  limit: number = 20
): Promise<BidangIlmuSearchResponse> {
  const params = new URLSearchParams({
    search,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/bidang-ilmu/search?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch bidang ilmu');
  }

  return response.json();
}

/**
 * Get bidang ilmu detail by ID for public dashboard
 */
export async function getBidangIlmuDetail(id: string): Promise<BidangIlmuDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/bidang-ilmu/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch bidang ilmu detail');
  }

  return response.json();
}
