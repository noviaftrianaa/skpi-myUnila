/**
 * Referensi Service
 * Handles API calls for referensi metadata and batch sync operations
 */

import { sisterClient } from '@/lib/api/sisterClient';

export interface ReferensiMetadata {
  key: string;
  name: string;
  description: string;
  total_records: number;
  last_sync: string | null;
  synced_by: string;
  available: boolean;
}

export interface BatchSyncResult {
  endpoint: string;
  success: boolean;
  total_records: number;
  message: string;
  error?: string;
}

export interface BatchSyncResponse {
  total_requested: number;
  total_success: number;
  total_failed: number;
  results: BatchSyncResult[];
  duration: string;
}

export const referensiService = {
  /**
   * Get metadata for all referensi endpoints
   */
  async getMetadata(): Promise<ReferensiMetadata[]> {
    try {
      const response = await sisterClient.get('/api/v1/referensi/metadata');
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching referensi metadata:", error);
      throw error;
    }
  },

  /**
   * Batch sync multiple endpoints in parallel
   */
  async batchSync(endpoints: string[]): Promise<BatchSyncResponse> {
    try {
      const response = await sisterClient.post('/api/v1/referensi/batch-sync', {
        endpoints: endpoints,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error batch syncing referensi:", error);
      throw error;
    }
  },

  /**
   * Get data for a specific endpoint
   */
  async getEndpointData(key: string): Promise<any[]> {
    try {
      const endpointMap: { [key: string]: string } = {
        agama: "agama",
        negara: "negara",
        jenjang_pendidikan: "jenjang-pendidikan",
        gelar_akademik: "gelar-akademik",
        semester: "semester",
        bidang_studi: "bidang-studi",
        bidang_usaha: "bidang-usaha",
        jabatan_fungsional: "jabatan-fungsional",
        jabatan_tugas_tambahan: "jabatan-tugas-tambahan",
        jenis_bahan_ajar: "jenis-bahan-ajar",
        jenis_beasiswa: "jenis-beasiswa",
        jenis_diklat: "jenis-diklat",
        jenis_dokumen: "jenis-dokumen",
        jenis_keluar: "jenis-keluar",
        jenis_kepanitiaan: "jenis-kepanitiaan",
        jenis_kesejahteraan: "jenis-kesejahteraan",
        jenis_publikasi: "jenis-publikasi",
        jenis_tes: "jenis-tes",
        jenis_tunjangan: "jenis-tunjangan",
        media_publikasi: "media-publikasi",
        skim_kegiatan: "skim-kegiatan",
        status_kepegawaian: "status-kepegawaian",
        sumber_gaji: "sumber-gaji",
        tingkat_penghargaan: "tingkat-penghargaan",
        wilayah: "wilayah",
        kategori_capaian_luaran: "kategori-capaian-luaran",
        kategori_kegiatan: "kategori-kegiatan",
        kelompok_bidang: "kelompok-bidang",
        lembaga_sertifikasi: "lembaga-sertifikasi",
        golongan_pangkat: "golongan-pangkat",
        ikatan_kerja: "ikatan-kerja",
        jenis_penghargaan: "jenis-penghargaan",
        jenis_pekerjaan: "jenis-pekerjaan",
        // bidang_pekerjaan: "bidang-pekerjaan", // Removed as per user request
        unit_kerja: "unit-kerja",
      };

      const endpoint = endpointMap[key];
      if (!endpoint) {
        throw new Error(`Unknown endpoint key: ${key}`);
      }

      const response = await sisterClient.get(`/api/v1/referensi/${endpoint}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching ${key} data:`, error);
      throw error;
    }
  },

  /**
   * Sync individual endpoint
   */
  async syncEndpoint(key: string): Promise<any> {
    try {
      const endpointMap: { [key: string]: string } = {
        agama: "agama",
        negara: "negara",
        jenjang_pendidikan: "jenjang-pendidikan",
        gelar_akademik: "gelar-akademik",
        semester: "semester",
        bidang_studi: "bidang-studi",
        bidang_usaha: "bidang-usaha",
        jabatan_fungsional: "jabatan-fungsional",
        jabatan_tugas_tambahan: "jabatan-tugas-tambahan",
        jenis_bahan_ajar: "jenis-bahan-ajar",
        jenis_beasiswa: "jenis-beasiswa",
        jenis_diklat: "jenis-diklat",
        jenis_dokumen: "jenis-dokumen",
        jenis_keluar: "jenis-keluar",
        jenis_kepanitiaan: "jenis-kepanitiaan",
        jenis_kesejahteraan: "jenis-kesejahteraan",
        jenis_publikasi: "jenis-publikasi",
        jenis_tes: "jenis-tes",
        jenis_tunjangan: "jenis-tunjangan",
        media_publikasi: "media-publikasi",
        skim_kegiatan: "skim-kegiatan",
        status_kepegawaian: "status-kepegawaian",
        sumber_gaji: "sumber-gaji",
        tingkat_penghargaan: "tingkat-penghargaan",
        wilayah: "wilayah",
        kategori_capaian_luaran: "kategori-capaian-luaran",
        kategori_kegiatan: "kategori-kegiatan",
        kelompok_bidang: "kelompok-bidang",
        lembaga_sertifikasi: "lembaga-sertifikasi",
        golongan_pangkat: "golongan-pangkat",
        ikatan_kerja: "ikatan-kerja",
        jenis_penghargaan: "jenis-penghargaan",
        jenis_pekerjaan: "jenis-pekerjaan",
        // bidang_pekerjaan: "bidang-pekerjaan", // Removed as per user request
        unit_kerja: "unit-kerja",
      };

      const endpoint = endpointMap[key];
      if (!endpoint) {
        throw new Error(`Unknown endpoint key: ${key}`);
      }

      const response = await sisterClient.post(`/api/v1/referensi/${endpoint}/sync`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing ${key}:`, error);
      throw error;
    }
  },
};
