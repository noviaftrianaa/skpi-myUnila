/**
 * Dosen Service
 * Service untuk mengambil data dosen
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';
const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083/public';

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

// ========== SISTER API Types & Service ==========

// SISTER Dosen Data (from pdrd.sdm table)
export interface SisterDosen {
  id_sdm: string;
  nama_sdm: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  nik: string;
  nidn: string;
  nip: string;
  email: string;
  no_hp: string;
  id_jenis_sdm: number;
  id_status_aktif: number;
  last_sync: string;
}

// Paginated list response
export interface SisterDosenListResult {
  data: SisterDosen[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Statistics response
export interface SisterDosenStats {
  total_dosen: number;
  total_aktif: number;
  total_tidak_aktif: number;
  by_jenis_sdm: Array<{
    id_jns_sdm: number;
    nm_jns_sdm: string;
    total: number;
  }>;
  by_status_aktif: Array<{
    id_stat_aktif: number;
    nm_stat_aktif: string;
    total: number;
  }>;
  last_sync: string | null;
}

// Batch sync result
export interface SisterDosenSyncResult {
  total_fetched: number;
  total_success: number;
  total_failed: number;
  duration_seconds: number;
  synced_by: string;
  synced_at: string;
}

// SISTER API Response wrapper
interface SisterApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * SISTER API Service for Dosen Management
 * Manages dosen data from SISTER Kemdikbud API
 */
export const sisterDosenService = {
  /**
   * Get paginated list of dosen with optional search and filters
   */
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    id_jns_sdm?: number;
    id_stat_aktif?: number;
  }): Promise<SisterDosenListResult> {
    const response = await axios.get<SisterApiResponse<SisterDosenListResult>>(
      `${SISTER_API_URL}/dosen`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get dosen statistics (total, by jenis, by status, etc)
   */
  async getStats(): Promise<SisterDosenStats> {
    const response = await axios.get<SisterApiResponse<SisterDosenStats>>(
      `${SISTER_API_URL}/dosen/stats`
    );
    return response.data.data;
  },

  /**
   * Get dosen detail by ID (GUID format)
   */
  async getDetail(idSDM: string): Promise<SisterDosen> {
    const response = await axios.get<SisterApiResponse<SisterDosen>>(
      `${SISTER_API_URL}/dosen/${idSDM}`
    );
    return response.data.data;
  },

  /**
   * Trigger batch sync from SISTER API to database
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<SisterDosenSyncResult> {
    const response = await axios.post<SisterApiResponse<SisterDosenSyncResult>>(
      `${SISTER_API_URL}/dosen/sync`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get dosen photo from SISTER API
   */
  async getPhoto(idSDM: string): Promise<Blob> {
    const response = await axios.get(`${SISTER_API_URL}/dosen/photo/${idSDM}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get dosen bidang ilmu/keahlian from SISTER API
   */
  async getBidangIlmu(idSDM: string): Promise<any[]> {
    const response = await axios.get<SisterApiResponse<any[]>>(
      `${SISTER_API_URL}/dosen/bidang_ilmu/${idSDM}`
    );
    return response.data.data;
  },
};
