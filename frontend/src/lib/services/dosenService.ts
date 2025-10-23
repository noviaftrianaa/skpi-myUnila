/**
 * Dosen Service
 * Service untuk mengambil data dosen
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';

// Types
export interface PendidikanDosen {
  jenjang: string;
  jumlah: number;
  persentase: number;
  color: string;
}

export interface JabatanDosen {
  jabatan: string;
  jumlah: number;
}

export interface DosenSummary {
  total_dosen: number;
  total_guru_besar: number;
  total_doktor: number;
  rasio_dosen_mahasiswa: string;
}

export interface DosenStatistics {
  summary: DosenSummary;
  pendidikan: {
    data: PendidikanDosen[];
    total_dosen: number;
  };
  jabatan: {
    data: JabatanDosen[];
    total_dosen: number;
  };
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dosenService = {
  async getStatistics(): Promise<DosenStatistics> {
    const response = await axios.get<ApiResponse<DosenStatistics>>(`${API_URL}/dosen/statistics`);
    return response.data.data;
  },

  async getPendidikan(): Promise<{ data: PendidikanDosen[]; total_dosen: number }> {
    const response = await axios.get<ApiResponse<{ data: PendidikanDosen[]; total_dosen: number }>>(`${API_URL}/dosen/pendidikan`);
    return response.data.data;
  },

  async getJabatan(): Promise<{ data: JabatanDosen[]; total_dosen: number }> {
    const response = await axios.get<ApiResponse<{ data: JabatanDosen[]; total_dosen: number }>>(`${API_URL}/dosen/jabatan`);
    return response.data.data;
  },
};
