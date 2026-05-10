import { dashboardClient } from '@/lib/api/dashboardClient';

export interface KknItem {
  id_anggota: string;
  npm: string | null;
  nm_mahasiswa: string | null;
  nm_kelompok: string;
  kode_kelompok: string;
  nm_kabupaten: string | null;
  nm_kecamatan: string | null;
  nm_desa: string | null;
  nm_periode: string;
  tahun_akademik: string | null;
  gelombang: string | null;
  peran: string | null;
  status: string | null;
  tgl_bergabung: string | null;
}

export interface KknStats {
  total_mhs: number;
  total_kelompok: number;
  total_lokasi: number;
  total_kabupaten: number;
  periode_aktif: number;
  total_periode: number;
  by_kabupaten: Array<{ nm_kabupaten: string; jml_mhs: number }>;
  by_periode: Array<{ nm_periode: string; tahun_akademik: string; gelombang: string; jml_mhs: number }>;
}

export interface KknPeriode {
  id_periode: string;
  nm_periode: string;
  tahun_akademik: string;
  gelombang: string;
  a_aktif: number;
}

export const kknDataService = {
  async getList(p: Record<string, any>) { return (await dashboardClient.get('/data/kkn', { params: p })).data.data; },
  async getStats(): Promise<KknStats> { return (await dashboardClient.get('/data/kkn/stats')).data.data; },
  async getPeriode(): Promise<KknPeriode[]> { return (await dashboardClient.get('/data/kkn/periode')).data.data; },
};
export default kknDataService;
