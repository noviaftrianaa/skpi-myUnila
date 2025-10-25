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

// Dosen Profile Types
export interface DosenProfile {
  id: string;
  id_sdm: string;
  nama: string;
  nidn?: string;
  nip: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  homebase: {
    fakultas: string;
    jurusan: string;
    prodi: string;
    jenjang: string;
  };
  riwayat_pendidikan: Array<{
    jenjang: string;
    program_studi: string;
    universitas: string;
    tahun_lulus: number;
  }>;
  riwayat_fungsional: Array<{
    jabatan: string;
    tmt: string;
    no_sk: string;
    tgl_sk: string;
  }>;
  riwayat_struktural: Array<{
    jabatan: string;
    tmt: string;
    no_sk: string;
    tgl_sk: string;
  }>;
  riwayat_kepangkatan: Array<{
    pangkat: string;
    tmt: string;
    no_sk: string;
    tgl_sk: string;
  }>;
  riwayat_sertifikasi: Array<{
    jenjang_sertifikasi: string;
    bidang_studi: string;
    no_sertifikat: string;
    no_registrasi: string;
    tahun: number;
  }>;
  riwayat_pengajaran: Array<{
    tahun_ajaran: string;
    mata_kuliah: string;
    program_studi: string;
    sks: number;
  }>;
  penelitian_pengabdian: Array<{
    tahun: number;
    judul: string;
    jenis: 'Penelitian' | 'Pengabdian';
    skema: string;
    status: 'Berjalan' | 'Selesai';
  }>;
  publikasi: {
    jurnal: Array<{
      tahun: number;
      judul: string;
      nama_jurnal: string;
      issn: string;
      quartile: string;
      jenis_jurnal?: string;
    }>;
    haki: Array<{
      tahun: number;
      judul: string;
      jenis: string;
      nomor_pendaftaran: string;
    }>;
    prosiding: Array<{
      tahun: number;
      judul: string;
      nama_seminar: string;
      jenis_prosiding?: string;
    }>;
    buku: Array<{
      tahun: number;
      judul: string;
      penerbit: string;
      isbn: string;
      jenis_buku?: string;
    }>;
  };
  statistics: {
    total_penelitian: number;
    total_pengabdian: number;
    total_publikasi: number;
    total_mata_kuliah: number;
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

  /**
   * Get dosen profile by encrypted ID
   */
  async getProfile(encryptedId: string): Promise<ApiResponse<DosenProfile>> {
    const response = await axios.get<ApiResponse<DosenProfile>>(`${API_URL}/dosen/${encryptedId}`);
    return response.data;
  },
};
