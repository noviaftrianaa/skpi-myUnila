/**
 * Tugas Tambahan Service
 * Service untuk mengambil data tugas tambahan dosen
 */

import axios from 'axios';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:9800/sister-service/public';

// Types
export interface TugasTambahan {
  id_tgs_tambah: string;
  id_sdm: string;
  id_jab_tgs: number;
  id_katgiat: number;
  id_sms?: { String: string; Valid: boolean } | null;
  id_sp?: { String: string; Valid: boolean } | null;
  jml_jam?: number | null;
  sk_tugas_tambah?: { String: string; Valid: boolean } | null;
  tmt_sk_tambah: string;
  tst_sk_tambah?: { Time: string; Valid: boolean } | null;
  last_sync?: { Time: string; Valid: boolean } | null;
  nama_dosen?: { String: string; Valid: boolean };
  nidn?: { String: string; Valid: boolean };
  jenis_tugas_name?: { String: string; Valid: boolean };
  unit_kerja_name?: { String: string; Valid: boolean };
  perguruan_tinggi_name?: { String: string; Valid: boolean };
  kategori_kegiatan_name?: { String: string; Valid: boolean };
}

export interface TugasTambahanStats {
  total_tugas: number;
  total_aktif: number;
  total_selesai: number;
  last_sync_date?: string | null;
}

export interface TugasTambahanListResult {
  data: TugasTambahan[];
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

export const sisterTugasTambahanService = {
  async getStats(): Promise<TugasTambahanStats> {
    const response = await axios.get<{ success: boolean; data: TugasTambahanStats }>(
      `${SISTER_API_URL}/tugas-tambahan/stats`
    );
    return response.data.data;
  },

  async getList(params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; message?: string; data: TugasTambahanListResult }> {
    const response = await axios.get(
      `${SISTER_API_URL}/tugas-tambahan/list`,
      { params }
    );
    return response.data;
  },

  async syncFromSister(syncedBy: string): Promise<BatchAllSyncResult> {
    const response = await axios.post<{ success: boolean; data: BatchAllSyncResult }>(
      `${SISTER_API_URL}/../api/v1/tugas-tambahan/sync-all`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  async getDetail(idTgsTambah: string): Promise<TugasTambahan> {
    const response = await axios.get<{ success: boolean; data: TugasTambahan }>(
      `${SISTER_API_URL}/tugas-tambahan/${idTgsTambah}`
    );
    return response.data.data;
  },
};

export const tugasTambahanHelpers = {
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

  getJenisTugas(jenisTugas?: { String: string; Valid: boolean }): string {
    if (!jenisTugas || !jenisTugas.Valid) return '-';
    return jenisTugas.String;
  },

  getUnitKerja(unitKerja?: { String: string; Valid: boolean }): string {
    if (!unitKerja || !unitKerja.Valid) return '-';
    return unitKerja.String;
  },

  getPerguruanTinggi(pt?: { String: string; Valid: boolean }): string {
    if (!pt || !pt.Valid) return '-';
    return pt.String;
  },

  getKategoriKegiatan(kategori?: { String: string; Valid: boolean }): string {
    if (!kategori || !kategori.Valid) return '-';
    return kategori.String;
  },

  getSKTugas(skTugas?: { String: string; Valid: boolean } | null): string {
    if (!skTugas || !skTugas.Valid) return '-';
    return skTugas.String;
  },

  getJumlahJam(jumlahJam?: number | null): string {
    if (jumlahJam === null || jumlahJam === undefined) return '-';
    return `${jumlahJam} jam`;
  },

  getStatusLabel(tmtSKTambah?: string, tstSKTambah?: { Time: string; Valid: boolean } | null): string {
    if (!tstSKTambah || !tstSKTambah.Valid) return 'Aktif';
    const endDate = new Date(tstSKTambah.Time);
    const now = new Date();
    return endDate > now ? 'Aktif' : 'Selesai';
  },

  getDuration(tmtSKTambah?: string, tstSKTambah?: { Time: string; Valid: boolean } | null): string {
    if (!tmtSKTambah) return '-';
    const startDate = new Date(tmtSKTambah);
    let endDate: Date;
    if (!tstSKTambah || !tstSKTambah.Valid) {
      endDate = new Date();
    } else {
      endDate = new Date(tstSKTambah.Time);
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

  getPeriodeText(tmtSKTambah?: string, tstSKTambah?: { Time: string; Valid: boolean } | null): string {
    const startMonth = this.formatMonth({ Time: tmtSKTambah || '', Valid: !!tmtSKTambah });
    const endMonth = this.formatMonth(tstSKTambah);

    if (endMonth === '-') {
      return `${startMonth} - Sekarang`;
    }
    return `${startMonth} - ${endMonth}`;
  },
};
