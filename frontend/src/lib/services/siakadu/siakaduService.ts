import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface SiakaduMahasiswa {
  nim: string;
  nama: string;
  nm_prodi?: string;
  nm_fakultas?: string;
  nm_jurusan?: string;
  angkatan?: string;
  jk?: string;
  semester?: string;
  ipk?: number;
  sks_total?: number;
  sks_lulus?: number;
  status?: string;
  status_mahasiswa?: string;
  last_sync?: string;
}

export interface MahasiswaFilterOptions {
  prodi: { id_unit: string; nm_prodi: string }[];
  angkatan: string[];
  status: string[];
}

export interface SiakaduKelas {
  id_kelas?: string;
  nama_kelas?: string;
  nama_mk?: string;
  sks_mk?: number;
  id_semester?: string;
  nm_prodi?: string;
  last_sync?: string;
}

export interface KelasFilterOptions {
  semester: string[];
  prodi: { id_unit: string; nm_prodi: string }[];
}

export interface SiakaduKurikulum {
  id_kurikulum?: string;
  thn_kurikulum?: number;
  semester?: number;
  kode_mk?: string;
  nama_mata_kuliah?: string;
  sks?: number;
  jenis_mk?: string;
  nm_prodi?: string;
  last_sync?: string;
}

export interface KurikulumFilterOptions {
  prodi: { id_unit: string; nm_prodi: string }[];
  jenis_mk: string[];
}

export interface SiakaduMataKuliah {
  id_mata_kuliah?: string;
  kode_mk: string;
  nama_mata_kuliah: string;
  sks?: number;
  jenis_mk?: string;
  nm_prodi?: string;
  last_sync?: string;
}

export interface MatakuliahFilterOptions {
  prodi: { id_unit: string; nm_prodi: string }[];
  jenis_mk: string[];
}

export interface SiakaduKHS {
  nim?: string;
  nama_mahasiswa?: string;
  nm_prodi?: string;
  angkatan?: string;
  id_semester?: string;
  kode_mk?: string;
  nama_mk?: string;
  sks_mk?: number;
  nilai_huruf?: string;
  nilai_angka?: number;
  nilai_index?: number;
  last_sync?: string;
}

export interface KHSFilterOptions {
  semester: string[];
  prodi: { id_unit: string; nm_prodi: string }[];
  angkatan: string[];
}

export interface SiakaduKRS {
  nim?: string;
  nama_mahasiswa?: string;
  id_semester?: string;
  status_kuliah?: string;
  ips?: number;
  sks_smt?: number;
  ipk?: number;
  total_sks?: number;
  last_sync?: string;
}

export interface SiakaduTranskrip {
  nim?: string;
  nama_mahasiswa?: string;
  nm_prodi?: string;
  angkatan?: string;
  kode_mk?: string;
  nama_mk?: string;
  sks_mk?: number;
  nilai_huruf?: string;
  nilai_index?: number;
  smt_ke?: number;
  last_sync?: string;
}

export interface TranskripFilterOptions {
  prodi: { id_unit: string; nm_prodi: string }[];
  angkatan: string[];
}

export interface SiakaduStatusKuliah {
  nim?: string;
  nama_mahasiswa?: string;
  nm_prodi?: string;
  angkatan?: string;
  id_semester?: string;
  status_kuliah?: string;
  ips?: number;
  sks_smt?: number;
  ipk?: number;
  total_sks?: number;
  last_sync?: string;
}

export interface KuliahFilterOptions {
  semester: string[];
  prodi: { id_unit: string; nm_prodi: string }[];
  angkatan: string[];
  status: string[];
}

export interface SiakaduWisuda {
  nim: string;
  nama: string;
  nm_prodi?: string;
  nm_fakultas?: string;
  angkatan?: string;
  ipk?: number;
  sks_lulus?: number;
  sks_total?: number;
  id_periode?: string;
  nm_periode?: string;
  tgl_lulus?: string;
  no_sk_yudisium?: string;
  last_sync?: string;
}

export interface WisudaFilterOptions {
  periode: { id_periode: string; nm_periode: string }[];
  prodi: { id_unit: string; nm_prodi: string }[];
  angkatan: string[];
}

export interface SiakaduSyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  duration_ms: number;
  message: string;
  total_processed?: number;
  total_success?: number;
  total_failed?: number;
}

export interface SiakaduSyncStats {
  total_records: number;
  last_sync?: string;
  last_sync_by?: string;
}

// ============ Service ============

const siakaduService = {
  // ---- Mahasiswa ----
  async getMahasiswaList(params: {
    page?: number; limit?: number; search?: string;
    id_unit?: string; angkatan?: string; status?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/mahasiswa', { params });
    return response.data;
  },

  async getMahasiswaFilters(): Promise<{ success: boolean; data: MahasiswaFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/mahasiswa/filters');
    return response.data;
  },

  async getMahasiswaStats() {
    const response = await myunilaClient.get('/siakadu/mahasiswa/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getMahasiswaByNIM(nim: string) {
    const response = await myunilaClient.get(`/siakadu/mahasiswa/${nim}`);
    return response.data;
  },

  async syncMahasiswa(filter?: { id_unit?: string; limit?: number }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/mahasiswa/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  async syncMahasiswaDetail(limit?: number, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/mahasiswa/sync-detail', null, {
      params: { limit: limit || 100, synced_by },
    });
    return response.data;
  },

  async syncMahasiswaFull(detailLimit?: number, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/mahasiswa/sync-full', null, {
      params: { detail_limit: detailLimit || 500, synced_by },
    });
    return response.data;
  },

  // ---- Kelas ----
  async getKelasList(params: {
    page?: number; limit?: number; search?: string;
    id_smt?: string; id_unit?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/akademik/kelas', { params });
    return response.data;
  },

  async getKelasStats() {
    const response = await myunilaClient.get('/siakadu/akademik/kelas/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getKelasFilters(): Promise<{ success: boolean; data: KelasFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/akademik/kelas/filters');
    return response.data;
  },

  async syncKelas(filter?: { id_semester?: string; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kelas/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Kurikulum ----
  async getKurikulumList(params: {
    page?: number; limit?: number; search?: string;
    jenis_mk?: string; id_unit?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum', { params });
    return response.data;
  },

  async getKurikulumStats() {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getKurikulumFilters(): Promise<{ success: boolean; data: KurikulumFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum/filters');
    return response.data;
  },

  async syncKurikulum(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kurikulum/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Matakuliah ----
  async getMatakuliahList(params: {
    page?: number; limit?: number; search?: string;
    jenis_mk?: string; id_unit?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah', { params });
    return response.data;
  },

  async getMatakuliahStats() {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getMatakuliahFilters(): Promise<{ success: boolean; data: MatakuliahFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah/filters');
    return response.data;
  },

  async syncMatakuliah(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/matakuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- KHS ----
  async getKHSList(params: {
    page?: number; limit?: number; search?: string;
    id_smt?: string; nim?: string; id_unit?: string; angkatan?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/nilai/khs', { params });
    return response.data;
  },

  async getKHSStats() {
    const response = await myunilaClient.get('/siakadu/nilai/khs/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getKHSFilters(): Promise<{ success: boolean; data: KHSFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/nilai/khs/filters');
    return response.data;
  },

  async syncKHS(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/khs/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- KRS ----
  // KRS — backend belum ada dedicated route, pakai kuliah endpoint
  async getKRSList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/nilai/kuliah', { params });
    return response.data;
  },

  async getKRSStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncKRS(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/kuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Transkrip ----
  async getTranskripList(params: {
    page?: number; limit?: number; search?: string;
    nim?: string; id_unit?: string; angkatan?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip', { params });
    return response.data;
  },

  async getTranskripStats() {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getTranskripFilters(): Promise<{ success: boolean; data: TranskripFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip/filters');
    return response.data;
  },

  async syncTranskrip(filter?: { npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/transkrip/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Status Kuliah ----
  async getStatusKuliahList(params: {
    page?: number; limit?: number; search?: string;
    id_smt?: string; id_unit?: string; angkatan?: string; status?: string;
    sort_by?: string; sort_order?: string;
  }) {
    const response = await myunilaClient.get('/siakadu/nilai/kuliah', { params });
    return response.data;
  },

  async getStatusKuliahStats() {
    const response = await myunilaClient.get('/siakadu/nilai/kuliah/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async getStatusKuliahFilters(): Promise<{ success: boolean; data: KuliahFilterOptions }> {
    const response = await myunilaClient.get('/siakadu/nilai/kuliah/filters');
    return response.data;
  },

  async syncStatusKuliah(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/kuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Wisuda ----
  async getWisudaList(params: { page?: number; limit?: number; search?: string; id_periode?: string; id_unit?: string; angkatan?: string; sort_by?: string; sort_order?: string }) {
    const response = await myunilaClient.get('/siakadu/wisuda', { params });
    return response.data;
  },
  async getWisudaStats() {
    const response = await myunilaClient.get('/siakadu/wisuda/stats', { params: { _t: Date.now() } });
    return response.data;
  },
  async getWisudaFilters() {
    const response = await myunilaClient.get('/siakadu/wisuda/filters');
    return response.data;
  },
  async syncWisuda(synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/wisuda/sync', null, { params: { synced_by } });
    return response.data;
  },

  // ---- Jadwal ----
  async getJadwalList(params: { page?: number; limit?: number; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/jadwal', { params });
    return response.data;
  },

  async getJadwalStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncJadwal(filter?: { id_semester?: string; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/jadwal/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },
};

export default siakaduService;
