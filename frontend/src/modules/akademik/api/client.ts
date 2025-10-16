/**
 * Akademik Service
 *
 * Handle academic operations:
 * - KRS (Kartu Rencana Studi)
 * - KHS (Kartu Hasil Studi)
 * - Nilai
 * - Jadwal
 * - Tugas Akhir
 * - Presensi
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type {
  KRS,
  KHS,
  Nilai,
  JadwalKuliah,
  TugasAkhir,
  BimbinganTA,
  Presensi,
  PresensiSummary,
} from '../types';
import type { ApiResponse } from '@/shared/types/api';

class AkademikService {
  // ==================== KRS ====================

  /**
   * Get KRS for specific semester
   */
  async getKRS(semester: string): Promise<KRS> {
    const { data } = await apiClient.get<ApiResponse<KRS>>(
      ENDPOINTS.AKADEMIK.KRS(semester)
    );
    return data.data;
  }

  /**
   * Submit KRS
   */
  async submitKRS(semester: string, krsData: KRS): Promise<void> {
    await apiClient.post(ENDPOINTS.AKADEMIK.KRS_SUBMIT(semester), krsData);
  }

  // ==================== KHS ====================

  /**
   * Get KHS for specific semester
   */
  async getKHS(semester: string): Promise<KHS> {
    const { data } = await apiClient.get<ApiResponse<KHS>>(
      ENDPOINTS.AKADEMIK.KHS(semester)
    );
    return data.data;
  }

  /**
   * Get all KHS
   */
  async getAllKHS(): Promise<KHS[]> {
    const { data } = await apiClient.get<ApiResponse<KHS[]>>(
      ENDPOINTS.AKADEMIK.KHS_ALL
    );
    return data.data;
  }

  // ==================== NILAI ====================

  /**
   * Get Nilai for specific semester
   */
  async getNilai(semester: string): Promise<Nilai[]> {
    const { data } = await apiClient.get<ApiResponse<Nilai[]>>(
      ENDPOINTS.AKADEMIK.NILAI(semester)
    );
    return data.data;
  }

  /**
   * Get all Nilai
   */
  async getAllNilai(): Promise<Nilai[]> {
    const { data } = await apiClient.get<ApiResponse<Nilai[]>>(
      ENDPOINTS.AKADEMIK.NILAI_ALL
    );
    return data.data;
  }

  /**
   * Get Transkrip
   */
  async getTranskrip(): Promise<KHS[]> {
    const { data } = await apiClient.get<ApiResponse<KHS[]>>(
      ENDPOINTS.AKADEMIK.TRANSKRIP
    );
    return data.data;
  }

  // ==================== JADWAL ====================

  /**
   * Get Jadwal for specific semester
   */
  async getJadwal(semester: string): Promise<JadwalKuliah[]> {
    const { data } = await apiClient.get<ApiResponse<JadwalKuliah[]>>(
      ENDPOINTS.AKADEMIK.JADWAL(semester)
    );
    return data.data;
  }

  // ==================== TUGAS AKHIR ====================

  /**
   * Get Tugas Akhir
   */
  async getTugasAkhir(): Promise<TugasAkhir | null> {
    const { data } = await apiClient.get<ApiResponse<TugasAkhir>>(
      ENDPOINTS.AKADEMIK.TUGAS_AKHIR
    );
    return data.data;
  }

  /**
   * Get Tugas Akhir detail
   */
  async getTugasAkhirDetail(id: string): Promise<TugasAkhir> {
    const { data } = await apiClient.get<ApiResponse<TugasAkhir>>(
      ENDPOINTS.AKADEMIK.TUGAS_AKHIR_DETAIL(id)
    );
    return data.data;
  }

  /**
   * Get Bimbingan history
   */
  async getBimbingan(idTA: string): Promise<BimbinganTA[]> {
    const { data } = await apiClient.get<ApiResponse<BimbinganTA[]>>(
      ENDPOINTS.AKADEMIK.BIMBINGAN(idTA)
    );
    return data.data;
  }

  // ==================== PRESENSI ====================

  /**
   * Get Presensi for specific semester
   */
  async getPresensi(semester: string): Promise<Presensi[]> {
    const { data } = await apiClient.get<ApiResponse<Presensi[]>>(
      ENDPOINTS.AKADEMIK.PRESENSI(semester)
    );
    return data.data;
  }

  /**
   * Get Presensi summary
   */
  async getPresensiSummary(): Promise<PresensiSummary[]> {
    const { data } = await apiClient.get<ApiResponse<PresensiSummary[]>>(
      ENDPOINTS.AKADEMIK.PRESENSI_SUMMARY
    );
    return data.data;
  }
}

// Export singleton instance
export const akademikService = new AkademikService();
export default akademikService;
