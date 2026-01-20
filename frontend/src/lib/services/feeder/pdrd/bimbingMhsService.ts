import { feederClient } from "@/lib/api/feederClient";

// Types for Bimbing Mhs (Dosen Pembimbing)
export interface BimbingMhsListItem {
  id_bimb_mhs: string;
  id_sdm: string;
  id_akt_mhs: string;
  urutan_promotor: number;
  nidn: string | null;
  nama_dosen: string | null;
  judul_aktivitas: string | null;
  jenis_aktivitas: string | null;
  nama_mahasiswa: string | null;
  nim: string | null;
  nama_prodi: string | null;
  last_sync: string | null;
}

export interface BimbingMhsStats {
  total_bimbingan: number;
  total_dosen: number;
  total_aktivitas: number;
  total_mahasiswa: number;
  last_sync: string | null;
}

export interface BimbingMhsListParams {
  page?: number;
  limit?: number;
  search?: string;
  id_prodi?: string;
  order_by?: string;
  order_dir?: "asc" | "desc";
}

export interface BimbingMhsSyncParams {
  synced_by: string;
  id_kategori_kegiatan?: number;
  id_prodi?: string;
}

export interface BimbingMhsSyncResult {
  total_fetched: number;
  total_synced: number;
  total_failed: number;
  total_skipped: number;
  duration: string;
  message: string;
  synced_by: string;
}

export interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi?: string;
  nm_jenj_didik?: string;
}

// Service functions
export const bimbingMhsService = {
  // Get paginated list
  async getList(params: BimbingMhsListParams) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.id_prodi) queryParams.append("id_prodi", params.id_prodi);
    if (params.order_by) queryParams.append("order_by", params.order_by);
    if (params.order_dir) queryParams.append("order_dir", params.order_dir);

    // Add cache buster
    queryParams.append("_t", Date.now().toString());

    const response = await feederClient.get(`/bimbing-mhs?${queryParams.toString()}`);
    return response.data;
  },

  // Get statistics
  async getStats() {
    const response = await feederClient.get("/bimbing-mhs/stats", {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  // Sync data from Feeder API
  async sync(params: BimbingMhsSyncParams) {
    const queryParams = new URLSearchParams();
    queryParams.append("synced_by", params.synced_by);

    if (params.id_kategori_kegiatan) {
      queryParams.append("id_kategori_kegiatan", params.id_kategori_kegiatan.toString());
    }
    if (params.id_prodi) {
      queryParams.append("id_prodi", params.id_prodi);
    }

    const response = await feederClient.post(`/bimbing-mhs/sync?${queryParams.toString()}`);
    return response.data;
  },

  // Get prodi options
  async getProdiList(): Promise<ProdiOption[]> {
    try {
      const response = await feederClient.get("/bimbing-mhs/prodi");
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching prodi list:", error);
      return [];
    }
  },
};

export default bimbingMhsService;
