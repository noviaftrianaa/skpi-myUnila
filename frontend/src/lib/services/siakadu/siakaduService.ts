import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface SiakaduMahasiswa {
  nim: string;
  nama: string;
  nm_prodi?: string;
  nm_fakultas?: string;
  angkatan?: string;
  ipk?: number;
  status?: string;
  last_sync?: string;
}

export interface SiakaduKelas {
  id_kelas?: string;
  nama_kelas?: string;
  nama_mk?: string;
  sks_mk?: number;
  id_semester?: string;
  last_sync?: string;
}

export interface SiakaduKurikulum {
  id_kurikulum?: string;
  semester?: number;
  kode_mk?: string;
  nama_mata_kuliah?: string;
  sks?: number;
  last_sync?: string;
}

export interface SiakaduMataKuliah {
  id_mata_kuliah?: string;
  kode_mk: string;
  nama_mata_kuliah: string;
  sks?: number;
  last_sync?: string;
}

export interface SiakaduKHS {
  nim?: string;
  nama_mahasiswa?: string;
  id_semester?: string;
  kode_mk?: string;
  nama_mk?: string;
  sks_mk?: number;
  nilai_huruf?: string;
  nilai_angka?: number;
  nilai_index?: number;
  last_sync?: string;
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
  kode_mk?: string;
  nama_mk?: string;
  sks_mk?: number;
  nilai_huruf?: string;
  nilai_index?: number;
  smt_ke?: number;
  last_sync?: string;
}

export interface SiakaduStatusKuliah {
  nim?: string;
  id_semester?: string;
  status_kuliah?: string;
  ips?: number;
  ipk?: number;
  sks_smt?: number;
  total_sks?: number;
  last_sync?: string;
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
  async getMahasiswaList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/siakadu/mahasiswa', { params });
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

  // ---- Kelas ----
  async getKelasList(params: { page?: number; limit?: number; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/kelas', { params });
    return response.data;
  },

  async getKelasStats() {
    // Backend belum punya /stats endpoint — return default
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncKelas(filter?: { id_semester?: string; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kelas/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Kurikulum ----
  async getKurikulumList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum', { params });
    return response.data;
  },

  async getKurikulumStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncKurikulum(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kurikulum/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Matakuliah ----
  async getMatakuliahList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah', { params });
    return response.data;
  },

  async getMatakuliahStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncMatakuliah(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/matakuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- KHS ----
  async getKHSList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/nilai/khs', { params });
    return response.data;
  },

  async getKHSStats() {
    return { data: { total_records: 0, last_sync: null } };
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
  async getTranskripList(params: { page?: number; limit?: number; npm?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip', { params });
    return response.data;
  },

  async getTranskripStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncTranskrip(filter?: { npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/transkrip/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Status Kuliah ----
  // Status Kuliah — backend belum ada dedicated route, pakai mahasiswa endpoint
  async getStatusKuliahList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/mahasiswa', { params });
    return response.data;
  },

  async getStatusKuliahStats() {
    return { data: { total_records: 0, last_sync: null } };
  },

  async syncStatusKuliah(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/mahasiswa/sync', filter, {
      params: { synced_by },
    });
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
