/**
 * Capaian Lulusan Service
 * Service untuk mengambil data capaian lulusan (tracer study)
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
  ? `${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/public/api/v1`
  : 'http://localhost:9800/dashboard-service/public/api/v1';

// Types
export interface StatusLulusan {
  bekerja: number;
  wiraswasta: number;
  kuliah_lanjut: number;
  belum_bekerja: number;
}

export interface KesesuaianBidang {
  tingkat: number;
  label: string;
  jumlah: number;
}

export interface LevelPerusahaan {
  level: string;
  jumlah: number;
}

export interface WaktuTungguTrend {
  tahun: number;
  avg_waktu_tunggu: number;
  jumlah: number;
}

export interface IncomeDistribution {
  range: string;
  jumlah: number;
}

export interface LokasiKerjaProvinsi {
  id_provinsi: string;
  provinsi: string;
  jumlah: number;
}

export interface LokasiKerjaInternational {
  id_negara: string;
  negara: string;
  jumlah: number;
}

export interface CapaianLulusanStatistics {
  total_alumni: number;
  avg_waktu_tunggu: number;
  avg_income: number;
  bekerja_sebelum_lulus: number;
  persentase_bekerja_sebelum_lulus: number;
  status_lulusan: StatusLulusan;
  kesesuaian_bidang: KesesuaianBidang[];
  level_perusahaan: LevelPerusahaan[];
  waktu_tunggu_trend: WaktuTungguTrend[];
  income_distribution: IncomeDistribution[];
  lokasi_kerja_provinsi: LokasiKerjaProvinsi[];
  lokasi_kerja_international: LokasiKerjaInternational[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const capaianLulusanService = {
  async getStatistics(): Promise<CapaianLulusanStatistics> {
    const response = await axios.get<ApiResponse<CapaianLulusanStatistics>>(`${API_URL}/capaian-lulusan/statistics`);
    return response.data.data;
  },
};
