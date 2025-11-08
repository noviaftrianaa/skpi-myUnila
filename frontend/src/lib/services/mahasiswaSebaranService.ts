/**
 * Mahasiswa Sebaran Service
 * Service untuk mengambil data sebaran mahasiswa
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

// Types
export interface SebaranKabupaten {
  id_kabupaten: string;
  nama_kabupaten: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

export interface SebaranProvinsi {
  id_provinsi: string;
  nama_provinsi: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

export interface SebaranKabupatenResponse {
  success: boolean;
  message: string;
  data: {
    data: SebaranKabupaten[];
    total_mahasiswa: number;
    jumlah_kabupaten: number;
  };
}

export interface SebaranProvinsiResponse {
  success: boolean;
  message: string;
  data: {
    data: SebaranProvinsi[];
    total_mahasiswa: number;
    jumlah_provinsi: number;
  };
}

export interface SebaranStatisticsResponse {
  success: boolean;
  message: string;
  data: {
    provinsi: {
      data: SebaranProvinsi[];
      total_mahasiswa: number;
      jumlah_provinsi: number;
    };
    kabupaten: {
      data: SebaranKabupaten[];
      total_mahasiswa: number;
      jumlah_kabupaten: number;
    };
    statistics: {
      mahasiswa_lokal_persen: number;
      mahasiswa_luar_daerah_persen: number;
      total_provinsi: number;
      total_kabupaten: number;
    };
  };
}

/**
 * Get sebaran mahasiswa by kabupaten
 */
export const getSebaranByKabupaten = async (): Promise<SebaranKabupatenResponse> => {
  const response = await axios.get<SebaranKabupatenResponse>(
    `${API_URL}/mahasiswa-sebaran/kabupaten`
  );
  return response.data;
};

/**
 * Get sebaran mahasiswa by provinsi
 */
export const getSebaranByProvinsi = async (): Promise<SebaranProvinsiResponse> => {
  const response = await axios.get<SebaranProvinsiResponse>(
    `${API_URL}/mahasiswa-sebaran/provinsi`
  );
  return response.data;
};

/**
 * Get sebaran statistics (combined)
 */
export const getSebaranStatistics = async (): Promise<SebaranStatisticsResponse> => {
  const response = await axios.get<SebaranStatisticsResponse>(
    `${API_URL}/mahasiswa-sebaran/statistics`
  );
  return response.data;
};
