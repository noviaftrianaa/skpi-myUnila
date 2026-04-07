/**
 * Dosen Service
 * Service untuk mengambil data dosen
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

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

// Heatmap Types for Infografis
export interface HeatmapDataItem {
  jenjang: string;
  jabatan: string;
  jumlah: number;
}

export interface HeatmapPendidikanJabfung {
  xAxis: string[];
  yAxis: string[];
  data: number[][];
  maxValue: number;
  rawData: HeatmapDataItem[];
}

export interface HeatmapUsiaDataItem {
  usia: string;
  jenjang: string;
  jumlah: number;
}

export interface HeatmapUsiaPendidikan {
  xAxis: string[];
  yAxis: string[];
  data: number[][];
  maxValue: number;
  rawData: HeatmapUsiaDataItem[];
}

export interface HeatmapUsiaJabfungDataItem {
  usia: string;
  jabatan: string;
  jumlah: number;
}

export interface HeatmapUsiaJabfung {
  xAxis: string[];
  yAxis: string[];
  data: number[][];
  maxValue: number;
  rawData: HeatmapUsiaJabfungDataItem[];
}

export interface HeatmapIkatanStatusDataItem {
  ikatan: string;
  status: string;
  jumlah: number;
}

export interface HeatmapIkatanStatus {
  xAxis: string[];
  yAxis: string[];
  data: number[][];
  maxValue: number;
  rawData: HeatmapIkatanStatusDataItem[];
}

// Sertifikasi per Jabfung Types (Chart 5)
export interface SertifikasiJabfungItem {
  jabatan: string;
  sudah: number;
  belum: number;
}

export interface SertifikasiJabfungData {
  data: SertifikasiJabfungItem[];
  totalSudah: number;
  totalBelum: number;
  total: number;
}

// Gender & Usia Types (Chart 6)
export interface GenderUsiaItem {
  usia: string;
  laki_laki: number;
  perempuan: number;
}

export interface GenderUsiaData {
  data: GenderUsiaItem[];
  usiaGroups: string[];
  totalLakiLaki: number;
  totalPerempuan: number;
  total: number;
}

// Tren Sertifikasi Types (Chart 7)
export interface TrenSertifikasiItem {
  tahun: string;
  jumlah: number;
}

export interface TrenSertifikasiData {
  data: TrenSertifikasiItem[];
  total: number;
}

// Tren Jabfung Types (Chart 8)
export interface TrenJabfungItem {
  tahun: string;
  asisten_ahli: number;
  lektor: number;
  lektor_kepala: number;
  profesor: number;
}

export interface TrenJabfungData {
  data: TrenJabfungItem[];
  totals: {
    asisten_ahli: number;
    lektor: number;
    lektor_kepala: number;
    profesor: number;
  };
  grandTotal: number;
}

// Bidang Ilmu Type
export interface BidangIlmu {
  id_kel_bidang: string;
  kode_bidang: string;
  nama_bidang: string;
  urutan: number;
}

// Dosen Profile Types
export interface DosenProfile {
  id: string;
  photo_url?: string;
  nama: string;
  nama_tanpa_gelar?: string;
  nidn?: string;
  nuptk: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  homebase: {
    fakultas: string;
    jurusan: string;
    prodi: string;
    jenjang: string;
  };
  bidang_ilmu: BidangIlmu[];
  riwayat_pendidikan: Array<{
    jenjang: string;
    gelar?: string;
    program_studi: string;
    bidang_studi?: string;
    universitas: string;
    judul_tesis?: string;
    tahun_lulus: number;
  }>;
  riwayat_fungsional: Array<{
    jabatan: string;
    tmt: string;
    no_sk: string;
    tgl_sk: string;
  }>;
  tugas_tambahan: Array<{
    jabatan: string;
    deskripsi: string;
    nama_unit?: string;
    tmt: string;
    no_sk: string;
    tgl_sk: string;
  }>;
  riwayat_struktural: Array<{
    jabatan: string;
    deskripsi: string;
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
    id_litabmas: string;
    tahun: number;
    judul: string;
    jenis: 'Penelitian' | 'Pengabdian';
    skema: string;
    status: 'Berjalan' | 'Selesai';
  }>;
  publikasi: {
    jurnal: Array<{
      id_publikasi: string;
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

// All Infografis Data (unified endpoint response)
export interface AllInfografisData {
  heatmapPendidikanJabfung: HeatmapPendidikanJabfung;
  heatmapUsiaPendidikan: HeatmapUsiaPendidikan;
  heatmapUsiaJabfung: HeatmapUsiaJabfung;
  heatmapIkatanStatus: HeatmapIkatanStatus;
  sertifikasiJabfung: SertifikasiJabfungData;
  genderUsia: GenderUsiaData;
  trenSertifikasi: TrenSertifikasiData;
  trenJabfung: TrenJabfungData;
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

  /**
   * Get all infografis data in a single request (RECOMMENDED - faster)
   * Use this instead of calling individual endpoints for better performance
   */
  async getAllInfografis(): Promise<AllInfografisData> {
    const response = await axios.get<ApiResponse<AllInfografisData>>(`${API_URL}/dosen-infografis/all`);
    return response.data.data;
  },

  /**
   * Get heatmap data: Jenjang Pendidikan vs Jabatan Fungsional
   * @deprecated Use getAllInfografis() for better performance
   */
  async getHeatmapPendidikanJabfung(): Promise<HeatmapPendidikanJabfung> {
    const response = await axios.get<ApiResponse<HeatmapPendidikanJabfung>>(`${API_URL}/dosen-infografis/heatmap/pendidikan-jabfung`);
    return response.data.data;
  },

  /**
   * Get heatmap data: Kelompok Usia vs Jenjang Pendidikan
   */
  async getHeatmapUsiaPendidikan(): Promise<HeatmapUsiaPendidikan> {
    const response = await axios.get<ApiResponse<HeatmapUsiaPendidikan>>(`${API_URL}/dosen-infografis/heatmap/usia-pendidikan`);
    return response.data.data;
  },

  /**
   * Get heatmap data: Kelompok Usia vs Jabatan Fungsional
   */
  async getHeatmapUsiaJabfung(): Promise<HeatmapUsiaJabfung> {
    const response = await axios.get<ApiResponse<HeatmapUsiaJabfung>>(`${API_URL}/dosen-infografis/heatmap/usia-jabfung`);
    return response.data.data;
  },

  /**
   * Get heatmap data: Ikatan Kerja vs Status Pegawai
   */
  async getHeatmapIkatanStatus(): Promise<HeatmapIkatanStatus> {
    const response = await axios.get<ApiResponse<HeatmapIkatanStatus>>(`${API_URL}/dosen-infografis/heatmap/ikatan-status`);
    return response.data.data;
  },

  /**
   * Get sertifikasi per jabatan fungsional (diverging bar chart)
   */
  async getSertifikasiJabfung(): Promise<SertifikasiJabfungData> {
    const response = await axios.get<ApiResponse<SertifikasiJabfungData>>(`${API_URL}/dosen-infografis/sertifikasi-jabfung`);
    return response.data.data;
  },

  /**
   * Get gender & usia distribution (population pyramid)
   */
  async getGenderUsia(): Promise<GenderUsiaData> {
    const response = await axios.get<ApiResponse<GenderUsiaData>>(`${API_URL}/dosen-infografis/gender-usia`);
    return response.data.data;
  },

  /**
   * Get tren sertifikasi dosen 5 tahun terakhir
   */
  async getTrenSertifikasi(): Promise<TrenSertifikasiData> {
    const response = await axios.get<ApiResponse<TrenSertifikasiData>>(`${API_URL}/dosen-infografis/tren-sertifikasi`);
    return response.data.data;
  },

  /**
   * Get tren jabatan fungsional dosen 5 tahun terakhir
   */
  async getTrenJabfung(): Promise<TrenJabfungData> {
    const response = await axios.get<ApiResponse<TrenJabfungData>>(`${API_URL}/dosen-infografis/tren-jabfung`);
    return response.data.data;
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
  nuptk: string;
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
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    id_jns_sdm?: number;
    id_stat_aktif?: number;
  }): Promise<SisterDosenListResult> {
    const response = await sisterClient.get<SisterApiResponse<SisterDosenListResult>>(
      '/dosen',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get dosen statistics (total, by jenis, by status, etc)
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<SisterDosenStats> {
    const response = await sisterClient.get<SisterApiResponse<SisterDosenStats>>(
      '/dosen/stats'
    );
    return response.data.data;
  },

  /**
   * Get dosen detail by ID (GUID format)
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(idSDM: string): Promise<SisterDosen> {
    const response = await sisterClient.get<SisterApiResponse<SisterDosen>>(
      `/dosen/${idSDM}`
    );
    return response.data.data;
  },

  /**
   * Trigger batch sync from SISTER API to database
   * @param syncedBy - Username of person who triggered the sync
   */
  async syncFromSister(syncedBy: string): Promise<SisterDosenSyncResult> {
    const response = await sisterClient.post<SisterApiResponse<SisterDosenSyncResult>>(
      '/dosen/sync',
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },

  /**
   * Get dosen photo from SISTER API (public endpoint, no auth required)
   * Note: This endpoint is at /public/api/v1/dosen/photo (no JWT required)
   */
  async getPhoto(idSDM: string): Promise<Blob> {
    // Use public endpoint - no JWT required
    const SISTER_BASE_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:9800/sister-service';
    const response = await axios.get(`${SISTER_BASE_URL}/public/api/v1/dosen/photo/${idSDM}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get dosen bidang ilmu/keahlian from database (via public-service)
   */
  async getBidangIlmu(idSDM: string): Promise<any[]> {
    const response = await axios.get<ApiResponse<any[]>>(
      `${API_URL}/dosen/bidang-ilmu/${idSDM}`
    );
    return response.data.data;
  },
};
