import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface SiakaduMahasiswa {
  nipd: string;
  nm_pd: string;
  id_sms: string;
  nm_prodi?: string;
  angkatan?: string;
  ipk?: number;
  status?: string;
  last_sync?: string;
}

export interface SiakaduKelas {
  id_kls: string;
  kode_mk?: string;
  nm_mk?: string;
  sks?: number;
  nm_kls?: string;
  id_smt?: string;
  nm_prodi?: string;
}

export interface SiakaduKurikulum {
  id_kurikulum?: string;
  thn_kurikulum?: number;
  kode_mk?: string;
  nm_mk?: string;
  sks_mk?: number;
  jenis_mk?: string;
  nm_prodi?: string;
}

export interface SiakaduMataKuliah {
  kode_mk: string;
  nm_mk: string;
  sks_mk?: number;
  jenis_mk?: string;
  nm_prodi?: string;
}

export interface SiakaduKHS {
  nipd?: string;
  nm_pd?: string;
  kode_mk?: string;
  nm_mk?: string;
  nilai_huruf?: string;
  nilai_angka?: number;
  nilai_indeks?: number;
  id_smt?: string;
}

export interface SiakaduKRS {
  nipd?: string;
  nm_pd?: string;
  kode_mk?: string;
  nm_kls?: string;
  status_krs?: string;
  id_smt?: string;
}

export interface SiakaduTranskrip {
  nipd?: string;
  nm_pd?: string;
  kode_mk?: string;
  nm_mk?: string;
  sks_mk?: number;
  nilai_huruf?: string;
  id_smt?: string;
}

export interface SiakaduStatusKuliah {
  nipd?: string;
  id_smt?: string;
  status?: string;
  ips?: number;
  ipk?: number;
  sks_total?: number;
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
    const response = await myunilaClient.get('/siakadu/mahasiswa/list', { params });
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
    const response = await myunilaClient.get('/siakadu/akademik/kelas/list', { params });
    return response.data;
  },

  async getKelasStats() {
    const response = await myunilaClient.get('/siakadu/akademik/kelas/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncKelas(filter?: { id_semester?: string; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kelas/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Kurikulum ----
  async getKurikulumList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum/list', { params });
    return response.data;
  },

  async getKurikulumStats() {
    const response = await myunilaClient.get('/siakadu/akademik/kurikulum/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncKurikulum(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/kurikulum/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Matakuliah ----
  async getMatakuliahList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah/list', { params });
    return response.data;
  },

  async getMatakuliahStats() {
    const response = await myunilaClient.get('/siakadu/akademik/matakuliah/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncMatakuliah(filter?: { thn_kurikulum?: number; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/matakuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- KHS ----
  async getKHSList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/nilai/khs/list', { params });
    return response.data;
  },

  async getKHSStats() {
    const response = await myunilaClient.get('/siakadu/nilai/khs/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncKHS(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/khs/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- KRS ----
  async getKRSList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/krs/list', { params });
    return response.data;
  },

  async getKRSStats() {
    const response = await myunilaClient.get('/siakadu/akademik/krs/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncKRS(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/krs/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Transkrip ----
  async getTranskripList(params: { page?: number; limit?: number; npm?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip/list', { params });
    return response.data;
  },

  async getTranskripStats() {
    const response = await myunilaClient.get('/siakadu/nilai/transkrip/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncTranskrip(filter?: { npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/nilai/transkrip/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Status Kuliah ----
  async getStatusKuliahList(params: { page?: number; limit?: number; npm?: string; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/status-kuliah/list', { params });
    return response.data;
  },

  async getStatusKuliahStats() {
    const response = await myunilaClient.get('/siakadu/akademik/status-kuliah/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncStatusKuliah(filter?: { id_semester?: string; npm?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/status-kuliah/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },

  // ---- Jadwal ----
  async getJadwalList(params: { page?: number; limit?: number; id_smt?: string; search?: string }) {
    const response = await myunilaClient.get('/siakadu/akademik/jadwal/list', { params });
    return response.data;
  },

  async getJadwalStats() {
    const response = await myunilaClient.get('/siakadu/akademik/jadwal/stats', {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async syncJadwal(filter?: { id_semester?: string; id_unit?: string }, synced_by?: string) {
    const response = await myunilaClient.post('/siakadu/akademik/jadwal/sync', filter, {
      params: { synced_by },
    });
    return response.data;
  },
};

export default siakaduService;
