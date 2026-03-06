import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface JenjangFakultas {
  id: string;
  nama_fakultas: string;
  d3: number;
  d4: number;
  s1: number;
  s2: number;
  s2_terapan: number;
  s3: number;
  profesi: number;
  sp1: number;
  sp2: number;
  belum_jenjang: number;
  total: number;
}

export interface JenjangProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  d3: number;
  d4: number;
  s1: number;
  s2: number;
  s2_terapan: number;
  s3: number;
  profesi: number;
  sp1: number;
  sp2: number;
  belum_jenjang: number;
  total: number;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  jenjang_didik: string;
  status: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface GetJenjangFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetJenjangProdiParams {
  idFakultas: string;
  tahun_ajaran?: string;
}

export interface GetDataDosenParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
  prodi_id?: string;
  per_page?: number;
  page?: number;
  search?: string;
  jenjang_didik?: string;
}

export interface GetProdiParams {
  fakultas_id: string;
}

export interface GetJenjangFakultasHistoricalParams {
  tahun_ajaran?: string;
  years_back?: number;
  fakultas_id?: string;
}

export interface GetJenjangProdiHistoricalParams {
  fakultas_id: string;
  tahun_ajaran?: string;
  years_back?: number;
  prodi_id?: string;
}

export interface HistoricalJenjangData {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: JenjangFakultas[] | JenjangProdi[];
}

// ========================================
// Service
// ========================================

/**
 * Executive Jenjang Pendidikan Service
 *
 * Handles API calls for jenjang pendidikan (education level) data in Pimpinan Dashboard
 */
class ExecutiveJenjangPendidikanService {
  /**
   * Get jenjang pendidikan data at university level (per fakultas)
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getJenjangFakultas(
    params?: GetJenjangFakultasParams,
  ): Promise<JenjangFakultas[]> {
    const response = await executiveClient.get<{ data: JenjangFakultas[] }>(
      "/dosen/jenjang-pendidikan/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get jenjang pendidikan data at fakultas level (per prodi)
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getJenjangProdi(
    params: GetJenjangProdiParams,
  ): Promise<JenjangProdi[]> {
    const response = await executiveClient.get<{ data: JenjangProdi[] }>(
      `/dosen/jenjang-pendidikan/fakultas/${params.idFakultas}`,
      {
        params: {
          tahun_ajaran: params.tahun_ajaran,
        },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get dosen data with pagination
   * @param params - Query parameters (tahun_ajaran, fakultas_id, prodi_id, per_page, page, search)
   */
  async getDataDosen(
    params?: GetDataDosenParams,
  ): Promise<PaginationResponse<Dosen>> {
    const response = await executiveClient.get<PaginationResponse<Dosen>>(
      "/dosen/jenjang-pendidikan/data",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get tahun ajaran list (master data)
   */
  async getTahunAjaranList(): Promise<TahunAjaran[]> {
    const response = await executiveClient.get<{ data: TahunAjaran[] }>(
      "/dosen/jenjang-pendidikan/master/tahun-ajaran",
    );
    return response.data.data || [];
  }

  /**
   * Get fakultas list (master data)
   */
  async getFakultasList(): Promise<
    Array<{ id: string; nama_fakultas: string }>
  > {
    const response = await executiveClient.get<{
      data: Array<{ id: string; nama_fakultas: string }>;
    }>("/dosen/jenjang-pendidikan/master/fakultas");
    return response.data.data || [];
  }

  /**
   * Get prodi list by fakultas (master data)
   * @param params - Parameters including fakultas_id
   */
  async getProdiList(
    params: GetProdiParams,
  ): Promise<Array<{ id: string; nama_prodi: string }>> {
    const response = await executiveClient.get<{
      data: Array<{ id: string; nama_prodi: string }>;
    }>("/dosen/jenjang-pendidikan/master/prodi", {
      params,
    });
    return response.data.data || [];
  }

  /**
   * Get historical jenjang pendidikan data at university/fakultas level
   * @param params - Optional query parameters (tahun_ajaran, years_back, fakultas_id)
   */
  async getJenjangFakultasHistorical(
    params?: GetJenjangFakultasHistoricalParams,
  ): Promise<HistoricalJenjangData[]> {
    const response = await executiveClient.get<{ data: HistoricalJenjangData[] }>(
      "/dosen/jenjang-pendidikan/fakultas/historical",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get historical jenjang pendidikan data at fakultas level (per prodi)
   * @param params - Parameters including fakultas_id and optional tahun_ajaran, years_back, prodi_id
   */
  async getJenjangProdiHistorical(
    params: GetJenjangProdiHistoricalParams,
  ): Promise<HistoricalJenjangData[]> {
    const response = await executiveClient.get<{ data: HistoricalJenjangData[] }>(
      `/dosen/jenjang-pendidikan/fakultas/${params.fakultas_id}/historical`,
      {
        params: {
          tahun_ajaran: params.tahun_ajaran,
          years_back: params.years_back,
          prodi_id: params.prodi_id,
        },
      },
    );
    return response.data.data || [];
  }
}

export const executiveJenjangPendidikanService = new ExecutiveJenjangPendidikanService();
export default executiveJenjangPendidikanService;
