import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface TableStat {
  table: string;
  count: number;
}

export interface KKNStats {
  total_tables: number;
  total_rows: number;
  table_stats: TableStat[];
  last_sync: string | null;
  sqlserver_stats: TableStat[];
}

export interface SyncResult {
  table: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  duration_ms: number;
}

export interface SyncAllResult {
  results: SyncResult[];
  duration_ms: number;
  synced_by: string;
}

export interface SyncGroup {
  group: string;
  tables: string[];
  count: number;
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface PeriodeKKN {
  id_periode_kkn: string;
  kode_periode: string;
  nm_periode: string;
  tahun_akademik: string;
  gelombang: number;
  tgl_daftar_mulai: string | null;
  tgl_daftar_selesai: string | null;
  tgl_pelaksanaan_mulai: string | null;
  tgl_pelaksanaan_selesai: string | null;
  durasi_hari: number;
  kuota_total: number;
  a_aktif: number;
}

export interface LokasiKKN {
  id_lokasi: string;
  kode_lokasi: string;
  nm_desa: string;
  nm_kecamatan: string;
  nm_kabupaten: string;
  nm_provinsi: string;
  kode_pos: string;
  a_aktif: number;
}

export interface RegistrasiKKN {
  id_registrasi: string;
  nomor_registrasi: string;
  npm: string;
  nm_mahasiswa: string;
  nm_prodi: string;
  nm_fakultas: string;
  status: string;
  tgl_diajukan: string | null;
}

export interface KelompokKKN {
  id_kelompok: string;
  kode_kelompok: string;
  nm_kelompok: string;
  nm_periode: string;
  nm_desa: string;
  kuota: number;
  jumlah_anggota: number;
  status: string;
}

export interface DPLKelompok {
  id_dpl: string;
  nm_dosen: string;
  nidn: string;
  nip: string;
  peran: string;
  nm_kelompok: string;
  a_aktif: number;
}

export interface NilaiMahasiswa {
  id_nilai: string;
  npm: string;
  nm_mahasiswa: string;
  nm_kelompok: string;
  nilai: number;
  catatan: string;
  tgl_penilaian: string | null;
  legacy_source: string;
}

export interface ProgramKerja {
  id_proker: string;
  nm_kelompok: string;
  nm_periode: string;
  judul: string;
  bidang: string;
  status: string;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
}

// ============ Service ============

const kknService = {
  async getStats(): Promise<{ success: boolean; data: KKNStats }> {
    const response = await myunilaClient.get('/kkn/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getGroups(): Promise<{ success: boolean; data: SyncGroup[] }> {
    const response = await myunilaClient.get('/kkn/groups');
    return response.data;
  },

  async syncGroup(group: string, syncedBy?: string): Promise<{ success: boolean; data: SyncResult }> {
    const response = await myunilaClient.post(`/kkn/sync/${group}`, null, {
      headers: { 'X-User-ID': syncedBy || 'system' },
      timeout: 1800000,
    });
    return response.data;
  },

  async syncAll(syncedBy?: string): Promise<{ success: boolean; data: SyncAllResult; summary: Record<string, number> }> {
    const response = await myunilaClient.post('/kkn/sync-all', null, {
      headers: { 'X-User-ID': syncedBy || 'system' },
      timeout: 3600000,
    });
    return response.data;
  },

  async listPeriode(params: ListParams = {}): Promise<{ success: boolean; data: PeriodeKKN[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/periode', { params });
    return response.data;
  },

  async listLokasi(params: ListParams = {}): Promise<{ success: boolean; data: LokasiKKN[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/lokasi', { params });
    return response.data;
  },

  async listRegistrasi(params: ListParams = {}): Promise<{ success: boolean; data: RegistrasiKKN[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/registrasi', { params });
    return response.data;
  },

  async listKelompok(params: ListParams = {}): Promise<{ success: boolean; data: KelompokKKN[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/kelompok', { params });
    return response.data;
  },

  async listDPL(params: ListParams = {}): Promise<{ success: boolean; data: DPLKelompok[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/dpl', { params });
    return response.data;
  },

  async listNilai(params: ListParams = {}): Promise<{ success: boolean; data: NilaiMahasiswa[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/nilai', { params });
    return response.data;
  },

  async listProgramKerja(params: ListParams = {}): Promise<{ success: boolean; data: ProgramKerja[]; meta: ListMeta }> {
    const response = await myunilaClient.get('/kkn/program-kerja', { params });
    return response.data;
  },
};

export default kknService;
