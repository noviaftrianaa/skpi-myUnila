/**
 * Publikasi Service
 * Service untuk mengambil data publikasi dosen
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';

// Types
export interface PublikasiByJenis {
  jenis: string;
  jumlah: number;
}

export interface PublikasiByYear {
  tahun: number;
  jumlah: number;
}

export interface PublikasiByKategoriCapaian {
  kategori: string;
  jumlah: number;
}

export interface PublikasiByPeran {
  peran: string;
  jumlah: number;
}

export interface PublikasiByFakultas {
  fakultas: string;
  jumlah: number;
}

export interface PublikasiStatistics {
  total: number;
  by_jenis: PublikasiByJenis[];
  by_year: PublikasiByYear[];
  by_kategori_capaian: PublikasiByKategoriCapaian[];
  by_peran: PublikasiByPeran[];
  by_fakultas: PublikasiByFakultas[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const publikasiService = {
  async getStatistics(): Promise<PublikasiStatistics> {
    const response = await axios.get<ApiResponse<PublikasiStatistics>>(`${API_URL}/publikasi/statistics`);
    return response.data.data;
  },
};
