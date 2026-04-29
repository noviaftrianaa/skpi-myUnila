import { myunilaClient } from "@/lib/api/myunilaClient";

export interface RefUnit {
  id_unit: string;
  id_parent_unit?: string | null;
  jns_unit: string;
  nm_unit?: string | null;
  nm_singkat?: string | null;
  nm_uniten?: string | null;
  id_jenjang?: string | null;
  akreditasi?: string | null;
  sk_akreditasi?: string | null;
  sks_lulus_min?: number | null;
  gelar?: string | null;
  desk_gelar?: string | null;
  ipk_lulus_min?: number | null;
  is_aktif?: string | null;
  alamat?: string | null;
  telepon?: string | null;
  pimpinan_count?: number;
  last_update?: string | null;
  last_sync?: string | null;
}

export interface PimpinanUnit {
  id_unit: string;
  nip: string;
  nama?: string | null;
  peran?: string | null;
  jabatan?: string | null;
  id_sdm?: string | null;
}

export interface UnitStats {
  total: number;
  aktif: number;
  by_jenis: Array<{ jns_unit: string; jml: number }>;
  total_pimpinan: number;
  last_sync?: string | null;
}

const unitPimpinanService = {
  async getList(params: {
    page?: number;
    limit?: number;
    search?: string;
    jns_unit?: string;
    is_aktif?: string;
  } = {}) {
    const r = await myunilaClient.get("/siakadu/referensi/unit", { params });
    return r.data as {
      success: boolean;
      data: RefUnit[];
      meta: { page: number; limit: number; total: number };
    };
  },

  async getPimpinanByUnit(idUnit: string) {
    const r = await myunilaClient.get(`/siakadu/referensi/unit/${idUnit}/pimpinan`);
    return r.data as { success: boolean; data: PimpinanUnit[] };
  },

  async getStats() {
    const r = await myunilaClient.get("/siakadu/referensi/unit/stats", {
      params: { _t: Date.now() },
    });
    return r.data as { success: boolean; data: UnitStats };
  },

  async sync(syncedBy?: string) {
    const r = await myunilaClient.post("/siakadu/referensi/unit/sync", null, {
      params: { synced_by: syncedBy },
      timeout: 10 * 60 * 1000,
    });
    return r.data as {
      success: boolean;
      message: string;
      data: {
        total_fetched: number;
        total_inserted: number;
        total_updated: number;
        total_errors: number;
        duration: string;
      };
    };
  },
};

export default unitPimpinanService;
