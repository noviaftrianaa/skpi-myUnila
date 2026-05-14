import { dashboardClient } from '@/lib/api/dashboardClient';

export interface TendikItem {
  id_pegawai: string;
  uuid_pegawai: string;
  nm_pegawai: string;
  jk: string;
  nip: string | null;
  tgl_lahir: string | null;
  tmp_lahir: string | null;
  jns_pegawai: string | null;
  jns_tenaga: string | null;
  status: string | null;
  tmt_cpns: string | null;
  tmt_pns: string | null;
  tmt_pensiun: string | null;
  id_org1: string | null; nm_org1: string | null;
  id_org2: string | null; nm_org2: string | null;
  id_org3: string | null; nm_org3: string | null;
  id_golongan: string | null;
  golongan: string | null;
  pangkat: string | null;
  id_fungsional: string | null;
  nm_jabfung: string | null;
  id_struktural: string | null;
  nm_jabstruk: string | null;
  id_pendidikan: string | null;
  pendidikan_terakhir: string | null;
}

export interface TendikStats {
  total: string;
  aktif: string;
  gender_l: string;
  gender_p: string;
  ber_nip: string;
  pns: string;
  pppk: string;
  honorer: string;
  struktural: string;
  by_jns_pegawai?: Array<{ jenis: string | null; jumlah: number | string }>;
  by_pendidikan?: Array<{ jenjang: string | null; jumlah: number | string }>;
  last_sync?: string | null;
  data_source?: string;
}

export interface TendikFilters {
  org1: Array<{ id_unit_orga: string; nm_unit_orga: string }>;
  jns_pegawai: Array<{ jenis: string }>;
  status: Array<{ status: string }>;
}

export const tendikDataService = {
  async getList(params: Record<string, any>): Promise<{ data: TendikItem[]; total: number }> {
    const r = await dashboardClient.get('/data/tendik', { params });
    return r.data.data;
  },
  async getStats(params: Record<string, any> = {}): Promise<TendikStats> {
    const r = await dashboardClient.get('/data/tendik/stats', { params });
    return r.data.data;
  },
  async getFilters(): Promise<TendikFilters> {
    const r = await dashboardClient.get('/data/tendik/filters');
    return r.data.data;
  },
};
export default tendikDataService;
