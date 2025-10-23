/**
 * Penelitian Service
 * Service untuk mengambil data penelitian dosen
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';

// Types
export interface PenelitianByKategori {
  kategori: string;
  jumlah: number;
}

export interface PenelitianByYear {
  tahun: number;
  jumlah: number;
}

export interface PenelitianByFunding {
  tahun: number;
  dana_dikti: number;
  dana_pt: number;
  dana_institusi_lain: number;
  total_dana: number;
}

export interface PenelitianByKelompokBidang {
  kelompok_bidang: string;
  jumlah: number;
}

export interface PenelitianByFakultas {
  fakultas: string;
  jumlah: number;
}

export interface PenelitianStatistics {
  total: number;
  by_kategori: PenelitianByKategori[];
  by_year: PenelitianByYear[];
  by_funding: PenelitianByFunding[];
  by_kelompok_bidang: PenelitianByKelompokBidang[];
  by_fakultas: PenelitianByFakultas[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const penelitianService = {
  async getStatistics(): Promise<PenelitianStatistics> {
    const response = await axios.get<ApiResponse<PenelitianStatistics>>(`${API_URL}/penelitian/statistics`);
    return response.data.data;
  },
};
