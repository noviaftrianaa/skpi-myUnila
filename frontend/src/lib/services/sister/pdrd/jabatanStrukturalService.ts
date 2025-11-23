/**
 * Jabatan Struktural Service
 * Service untuk mengambil data jabatan struktural dosen
 */

import { sisterClient } from '@/lib/api/sisterClient';

// Types
export interface JabatanStruktural {
  id_rwy_jabstruk: string;
  id_sdm: string;
  sk_jabstruk?: { String: string; Valid: boolean } | null;
  tmt_sk_jabstruk?: { Time: string; Valid: boolean } | null;
  tst_sk_jabstruk?: { Time: string; Valid: boolean } | null;
  lokasi_tugas?: { String: string; Valid: boolean } | null;
  last_sync?: { Time: string; Valid: boolean } | null;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  nama_jabatan?: { String: string; Valid: boolean };
  kategori_kegiatan?: { String: string; Valid: boolean };
}

export interface JabatanStrukturalStats {
  total_jabatan: number;
  total_aktif: number;
  total_selesai: number;
  last_sync_date?: string | null;
}

export interface JabatanStrukturalListResult {
  data: JabatanStruktural[];
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
 * SISTER API Service for Jabatan Struktural Management
 */
export const sisterJabatanStrukturalService = {
  /**
   * Get jabatan struktural statistics from SISTER API
   */
  async getStats(): Promise<JabatanStrukturalStats> {
    const response = await sisterClient.get<{ success: boolean; data: JabatanStrukturalStats }>(
      '/jabatan-struktural/stats'
    );
    return response.data.data;
  },

  /**
   * Get paginated list of jabatan struktural with search and sorting
   */
  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: JabatanStrukturalListResult }> {
    const response = await sisterClient.get(
      '/jabatan-struktural/list',
      { params }
    );
    return response.data;
  },

  /**
   * Trigger batch sync all jabatan struktural from SISTER API
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await sisterClient.post<{ success: boolean; data: BatchAllSyncResult }>(
      '/jabatan-struktural/sync-all',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get jabatan struktural detail by id
   */
  async getDetail(idRwyJabStruk: string): Promise<JabatanStruktural> {
    const response = await sisterClient.get<{ success: boolean; data: JabatanStruktural }>(
      `/jabatan-struktural/${idRwyJabStruk}`
    );
    return response.data.data;
  },
};

/**
 * Helper functions
 */
export const jabatanStrukturalHelpers = {
  formatDate(dateField?: { Time: string; Valid: boolean } | null): string {
    if (!dateField || !dateField.Valid) return '-';
    return new Date(dateField.Time).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatMonth(dateField?: { Time: string; Valid: boolean } | null): string {
    if (!dateField || !dateField.Valid) return '-';
    return new Date(dateField.Time).toLocaleDateString('id-ID', {
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

  getNamaJabatan(namaJabatan?: { String: string; Valid: boolean }): string {
    if (!namaJabatan || !namaJabatan.Valid) return '-';
    return namaJabatan.String;
  },

  getKategoriKegiatan(kategoriKegiatan?: { String: string; Valid: boolean }): string {
    if (!kategoriKegiatan || !kategoriKegiatan.Valid) return '-';
    return kategoriKegiatan.String;
  },

  getSKJabatan(skJabatan?: { String: string; Valid: boolean } | null): string {
    if (!skJabatan || !skJabatan.Valid) return '-';
    return skJabatan.String;
  },

  getLokasiTugas(lokasiTugas?: { String: string; Valid: boolean } | null): string {
    if (!lokasiTugas || !lokasiTugas.Valid) return '-';
    return lokasiTugas.String;
  },

  getStatusLabel(tmtSKJabStruk?: { Time: string; Valid: boolean } | null, tstSKJabStruk?: { Time: string; Valid: boolean } | null): string {
    if (!tstSKJabStruk || !tstSKJabStruk.Valid) return 'Aktif';

    const endDate = new Date(tstSKJabStruk.Time);
    const now = new Date();

    return endDate > now ? 'Aktif' : 'Selesai';
  },

  getDuration(tmtSKJabStruk?: { Time: string; Valid: boolean } | null, tstSKJabStruk?: { Time: string; Valid: boolean } | null): string {
    if (!tmtSKJabStruk || !tmtSKJabStruk.Valid) return '-';

    const startDate = new Date(tmtSKJabStruk.Time);
    let endDate: Date;

    if (!tstSKJabStruk || !tstSKJabStruk.Valid) {
      endDate = new Date(); // Sekarang
    } else {
      endDate = new Date(tstSKJabStruk.Time);
    }

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
