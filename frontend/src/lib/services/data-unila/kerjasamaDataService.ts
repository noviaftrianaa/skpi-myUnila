import { dashboardClient } from '@/lib/api/dashboardClient';

export interface MitraItem {
  id_mitra: string;
  jenis: 'LembagaIPTEK' | 'DUDI';
  nm_lemb: string;
  nm_singkat: string | null;
  email: string | null;
  no_tel: string | null;
  website: string | null;
  jln: string | null;
  ds_kel: string | null;
  kode_pos: string | null;
  mou_count: number;
  mou_aktif: number;
  tahun_mou_terbaru: number | null;
}

export interface MitraStats {
  total_mitra: number;
  total_lembaga_iptek: number;
  total_dudi: number;
  mou_aktif: number;
  mitra_ber_mou: number;
  by_tahun_mou?: Array<{ tahun: number; jumlah: number }>;
}

export const kerjasamaDataService = {
  async getList(p: Record<string, any>) { return (await dashboardClient.get('/data/kerjasama', { params: p })).data.data; },
  async getStats() { return (await dashboardClient.get('/data/kerjasama/stats')).data.data; },
  async getMitraList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/kerjasama/mitra', { params });
    return r.data.data;
  },
  async getMitraStats(params: Record<string, any> = {}): Promise<MitraStats> {
    const r = await dashboardClient.get('/data/kerjasama/mitra/stats', { params });
    return r.data.data;
  },
};
export default kerjasamaDataService;
