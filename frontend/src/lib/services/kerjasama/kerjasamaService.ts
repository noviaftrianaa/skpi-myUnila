import { myunilaClient } from '@/lib/api/myunilaClient';

// ============ Types ============

export interface MouListItem {
  id_mou: string;
  id_sikerma?: number | null;
  id_jenis_dokumen?: string | null;
  sk_mou?: string | null;
  judul_mou?: string | null;
  nm_dudi?: string | null;
  tgl_mulai?: string | null;
  tgl_selesai?: string | null;
  last_sync?: string | null;
}

export interface MouStats {
  total_mou: number;
  total_aktif: number;
  total_expired: number;
  total_mitra: number;
  last_sync?: string | null;
}

export interface UnitMapping {
  id_unit_mapping: string;
  sikerma_unit_id: number;
  kode_unit?: string | null;
  jenjang?: string | null;
  unit_nama?: string | null;
  nama_pendek?: string | null;
  id_sms?: string | null;
  nm_sms?: string | null;
  strategy?: string | null;
  notes?: string | null;
  last_check?: string | null;
  last_match?: string | null;
}

export interface UnitMappingStats {
  total: number;
  mapped: number;
  unmapped: number;
  by_strategy: Record<string, number>;
}

export interface SyncResult {
  started_at?: string;
  finished_at?: string;
  duration_ms?: number;
  unit_total?: number;
  unit_processed?: number;
  unit_failed?: number;
  mou_upserted?: number;
  mou_skipped?: number;
  mitra_upserted?: number;
  errors?: string[];
}

// ============ API ============

const kerjasamaService = {
  // MoU
  async getMouList(params: { page?: number; limit?: number; search?: string }) {
    const response = await myunilaClient.get('/kerjasama/mou', { params });
    return response.data as {
      success: boolean;
      data: MouListItem[];
      meta: { page: number; limit: number; total: number };
    };
  },

  async getMouStats() {
    const response = await myunilaClient.get('/kerjasama/mou/stats', {
      params: { _t: Date.now() },
    });
    return response.data as { success: boolean; data: MouStats };
  },

  async getMouByID(id: string) {
    const response = await myunilaClient.get(`/kerjasama/mou/${id}`);
    return response.data;
  },

  async syncKerjasama(unit_ids?: number[]) {
    const response = await myunilaClient.post(
      '/kerjasama/sync',
      { unit_ids: unit_ids || [] },
      { timeout: 30 * 60 * 1000 } // 30 min — full sync 110+ units
    );
    return response.data as { success: boolean; message: string; data: SyncResult };
  },

  // Unit mapping (audit + admin override)
  async getUnitMappingList(params: {
    page?: number;
    limit?: number;
    search?: string;
    strategy?: string;
  }) {
    const response = await myunilaClient.get('/kerjasama/unit-mapping', { params });
    return response.data as {
      success: boolean;
      data: UnitMapping[];
      meta: { page: number; limit: number; total: number };
    };
  },

  async getUnitMappingStats() {
    const response = await myunilaClient.get('/kerjasama/unit-mapping/stats', {
      params: { _t: Date.now() },
    });
    return response.data as { success: boolean; data: UnitMappingStats };
  },

  async updateUnitMapping(
    sikerma_unit_id: number,
    payload: { id_sms?: string | null; notes?: string | null }
  ) {
    const response = await myunilaClient.patch(
      `/kerjasama/unit-mapping/${sikerma_unit_id}`,
      payload
    );
    return response.data;
  },
};

export default kerjasamaService;
