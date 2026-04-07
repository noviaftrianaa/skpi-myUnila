import { dashboardClient } from '@/lib/api/dashboardClient';

export interface UktItem {
  id_daftar_ukt: string;
  nama_prodi: string;
  nama_fakultas: string;
  nm_prodi_pdrd: string;
  nm_fakultas_pdrd: string;
  tahun: number;
  kode_kelas: string;
  nama_kelas: string;
  nominal: number;
  kode_strata: string;
  jenjang: string;
}

export interface UktStats {
  total: string;
  tahun_awal: string;
  tahun_akhir: string;
  total_tahun: string;
  total_prodi: string;
  avg_nominal: string;
  max_nominal: string;
}

export interface SppItem {
  id_spp_mhs: string;
  nipd: string;
  nm_pd: string;
  nm_prodi: string;
  nm_fakultas: string;
  id_smt: string;
  nm_smt: string;
  tgl_bayar: string;
  nominal: number;
  total_tagihan: number;
  sisa_tagihan: number;
  a_cicil: number;
  cicilan_ke: number;
  flag_by: string;
  kelas_ukt: string;
}

export interface SppStats {
  total: string;
  total_tagihan: string;
  total_terbayar: string;
  lunas: string;
  cicilan: string;
}

export const keuanganDataService = {
  // ---- UKT ----
  async getUktList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/keuangan/ukt', { params });
    return r.data.data;
  },
  async getUktStats(): Promise<UktStats> {
    const r = await dashboardClient.get('/data/keuangan/ukt/stats');
    return r.data.data;
  },
  async getUktFilters(): Promise<{ tahun: Array<{ tahun: string }> }> {
    const r = await dashboardClient.get('/data/keuangan/ukt/filters');
    return r.data.data;
  },

  // ---- SPP ----
  async getSppList(params: Record<string, any>) {
    const r = await dashboardClient.get('/data/keuangan/spp', { params });
    return r.data.data;
  },
  async getSppStats(params: Record<string, any> = {}): Promise<SppStats> {
    const r = await dashboardClient.get('/data/keuangan/spp/stats', { params });
    return r.data.data;
  },
  async getSppFilters(): Promise<{ tahun: Array<{ tahun: string }> }> {
    const r = await dashboardClient.get('/data/keuangan/spp/filters');
    return r.data.data;
  },
};

export default keuanganDataService;
