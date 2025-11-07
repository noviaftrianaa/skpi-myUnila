/**
 * Sertifikasi Dosen Service
 * Service untuk mengambil data sertifikasi dosen
 */

import { sisterClient } from '@/lib/api/sisterClient';

// Types
export interface SertifikasiDosen {
  id_rwy_sert: string;
  id_sdm: string;
  thn_sert?: { Int32: number; Valid: boolean } | null;
  sk_sert?: { String: string; Valid: boolean } | null;
  nrg?: { String: string; Valid: boolean } | null;
  no_peserta?: { String: string; Valid: boolean } | null;
  tmt_sert?: { Time: string; Valid: boolean } | null;
  tst_sert?: { Time: string; Valid: boolean } | null;
  last_sync?: { Time: string; Valid: boolean } | null;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  jenis_sertifikasi?: { String: string; Valid: boolean };
  bidang_studi?: { String: string; Valid: boolean };
  lembaga_sertifikasi?: { String: string; Valid: boolean };
}

export interface SertifikasiDosenStats {
  total_sertifikasi: number;
  total_aktif: number;
  total_kadaluarsa: number;
  last_sync_date?: { Time: string; Valid: boolean } | null;
}

export interface SertifikasiDosenListResult {
  data: SertifikasiDosen[];
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

export const sisterSertifikasiDosenService = {
  async getStats(): Promise<SertifikasiDosenStats> {
    const response = await sisterClient.get<{ success: boolean; data: SertifikasiDosenStats }>(
      '/sertifikasi-dosen/stats'
    );
    return response.data.data;
  },

  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: SertifikasiDosenListResult }> {
    const response = await sisterClient.get(
      '/sertifikasi-dosen/list',
      { params }
    );
    return response.data;
  },

  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await sisterClient.post<{ success: boolean; data: BatchAllSyncResult }>(
      '/../api/v1/sertifikasi-dosen/sync-all',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  async getDetail(idRwySert: string): Promise<SertifikasiDosen> {
    const response = await sisterClient.get<{ success: boolean; data: SertifikasiDosen }>(
      `/sertifikasi-dosen/${idRwySert}`
    );
    return response.data.data;
  },
};

export const sertifikasiDosenHelpers = {
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

  formatYear(yearField?: { Int32: number; Valid: boolean } | null): string {
    if (!yearField || !yearField.Valid) return '-';
    return yearField.Int32.toString();
  },

  getDosenName(namaDosen?: { String: string; Valid: boolean }): string {
    if (!namaDosen || !namaDosen.Valid) return '-';
    return namaDosen.String;
  },

  getNIDN(nidn?: { String: string; Valid: boolean }): string {
    if (!nidn || !nidn.Valid) return '-';
    return nidn.String;
  },

  getJenisSertifikasi(jenisSertifikasi?: { String: string; Valid: boolean }): string {
    if (!jenisSertifikasi || !jenisSertifikasi.Valid) return '-';
    return jenisSertifikasi.String;
  },

  getBidangStudi(bidangStudi?: { String: string; Valid: boolean }): string {
    if (!bidangStudi || !bidangStudi.Valid) return '-';
    return bidangStudi.String;
  },

  getLembagaSertifikasi(lembaga?: { String: string; Valid: boolean }): string {
    if (!lembaga || !lembaga.Valid) return '-';
    return lembaga.String;
  },

  getSKSertifikasi(skSert?: { String: string; Valid: boolean } | null): string {
    if (!skSert || !skSert.Valid) return '-';
    return skSert.String;
  },

  getNomorRegistrasi(nrg?: { String: string; Valid: boolean } | null): string {
    if (!nrg || !nrg.Valid) return '-';
    return nrg.String;
  },

  getNomorPeserta(noPeserta?: { String: string; Valid: boolean } | null): string {
    if (!noPeserta || !noPeserta.Valid) return '-';
    return noPeserta.String;
  },

  getStatusLabel(tstSert?: { Time: string; Valid: boolean } | null): string {
    if (!tstSert || !tstSert.Valid) return 'Aktif';
    const endDate = new Date(tstSert.Time);
    const now = new Date();
    return endDate > now ? 'Aktif' : 'Kadaluarsa';
  },

  getStatusColor(tstSert?: { Time: string; Valid: boolean } | null): 'default' | 'success' | 'warning' | 'danger' {
    if (!tstSert || !tstSert.Valid) return 'success';
    const endDate = new Date(tstSert.Time);
    const now = new Date();
    return endDate > now ? 'success' : 'warning';
  },

  getMasaBerlaku(tmtSert?: { Time: string; Valid: boolean } | null, tstSert?: { Time: string; Valid: boolean } | null): string {
    const startMonth = this.formatMonth(tmtSert);
    const endMonth = this.formatMonth(tstSert);

    if (endMonth === '-') {
      return `${startMonth} - Seumur Hidup`;
    }
    return `${startMonth} - ${endMonth}`;
  },
};
