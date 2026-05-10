import { dashboardClient } from '@/lib/api/dashboardClient';

export interface ProdiStats {
  total: number;
  sarjana: number;
  profesi: number;
  magister: number;
  doktor: number;
  diploma: number;
  spesialis: number;
  unggul: number;
  akreditasi_breakdown: Array<{ peringkat: string; jumlah: number }>;
}

export interface AkreditasiStats {
  total: number;
  aktif: number;
  expired: number;
  akan_expire: number;
  unggul: number;
  baik_sekali: number;
  baik: number;
  by_lembaga: Array<{ lembaga: string; jumlah: number }>;
}

export interface MatkulStats {
  total: number;
  dgn_praktikum: number;
  teori_only: number;
  total_sks: number;
  rata_sks: number;
  by_jenis: Array<{ jenis: string; jumlah: number }>;
}

export const akademikDataService = {
  async getProdi(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/prodi', { params: p })).data.data; },
  async getProdiStats(): Promise<ProdiStats> { return (await dashboardClient.get('/data/akademik/prodi/stats')).data.data; },
  async getAkreditasi(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/akreditasi', { params: p })).data.data; },
  async getAkreditasiStats(): Promise<AkreditasiStats> { return (await dashboardClient.get('/data/akademik/akreditasi/stats')).data.data; },
  async getMatkul(p: Record<string, any>) { return (await dashboardClient.get('/data/akademik/matkul', { params: p })).data.data; },
  async getMatkulStats(): Promise<MatkulStats> { return (await dashboardClient.get('/data/akademik/matkul/stats')).data.data; },
};
export default akademikDataService;
