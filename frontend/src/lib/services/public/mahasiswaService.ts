/**
 * Mahasiswa Service
 * Service untuk mengambil data profil mahasiswa
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

export interface MahasiswaProfile {
  id_pd: string;
  nama: string;
  nim: string;
  jenis_kelamin: string;
  status: string;
  homebase: {
    prodi: string;
    jenjang: string;
    semester_masuk: string;
    tanggal_masuk: string;
    id_sms?: string | null;
    fakultas?: string | null;
    jurusan?: string | null;
  };
  status_semester: Array<{
    id_smt: string;
    semester: string;
    status: string;
    sks_diambil: number;
    total_sks: number;
  }>;
  mata_kuliah: Array<{
    semester: string;
    mata_kuliah: Array<{
      kode_mk: string;
      nama_mk: string;
      sks: number;
      nilai_huruf: string;
      nilai_indeks: number | null;
    }>;
  }>;
  statistics: {
    total_semester: number;
    total_mata_kuliah: number;
  };
}

export interface MahasiswaProfileResponse {
  success: boolean;
  message: string;
  data: MahasiswaProfile | null;
}

/**
 * Get mahasiswa profile by ID
 */
export async function getProfile(idPd: string): Promise<MahasiswaProfileResponse> {
  const response = await axios.get<MahasiswaProfileResponse>(`${API_URL}/mahasiswa/${idPd}`);
  return response.data;
}

export const mahasiswaService = {
  getProfile,
};
