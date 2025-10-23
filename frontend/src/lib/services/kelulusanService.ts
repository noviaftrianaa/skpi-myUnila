/**
 * Kelulusan Service
 * Service untuk mengambil data kelulusan tepat waktu mahasiswa
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL as string;

// Types
export interface KelulusanByYear {
  tahun: number;
  total_lulusan: number;
  tepat_waktu: number;
  tidak_tepat_waktu: number;
  persentase_tepat_waktu: number;
}

export interface KelulusanByJenjang {
  jenjang: string;
  total_lulusan: number;
  tepat_waktu: number;
  persentase_tepat_waktu: number;
}

export interface KelulusanByMasaStudi {
  kategori: string;
  jumlah: number;
  avg_ipk: number;
}

export interface KelulusanByFakultas {
  fakultas: string;
  total_lulusan: number;
  tepat_waktu: number;
  persentase_tepat_waktu: number;
}

export interface KelulusanStatistics {
  total: number;
  total_tepat_waktu: number;
  persentase_tepat_waktu: number;
  by_year: KelulusanByYear[];
  by_jenjang: KelulusanByJenjang[];
  by_masa_studi: KelulusanByMasaStudi[];
  by_fakultas: KelulusanByFakultas[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const kelulusanService = {
  async getStatistics(): Promise<KelulusanStatistics> {
    const response = await axios.get<ApiResponse<KelulusanStatistics>>(`${API_URL}/kelulusan/statistics`);
    return response.data.data;
  },
};
