import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface JenisKelaminFakultas {
  id: string;
  nama_fakultas: string;
  laki_laki: number;
  perempuan: number;
  total: number;
}

export interface JenisKelaminProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  laki_laki: number;
  perempuan: number;
  total: number;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  jenis_kelamin: string;
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

export interface GetJenisKelaminFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetJenisKelaminProdiParams {
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
}

export interface GetProdiParams {
  fakultas_id: string;
}

export interface TrendDataItem {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Array<{
    id: string;
    nama_fakultas?: string;
    nama_prodi?: string;
    laki_laki: number;
    perempuan: number;
    total: number;
  }>;
}

export interface GetJenisKelaminFakultasHistoricalParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetJenisKelaminProdiHistoricalParams {
  fakultas_id: string;
  tahun_ajaran?: string;
  prodi_id?: string;
}

// ========================================
// Service
// ========================================

/**
 * Executive Jenis Kelamin Service
 *
 * Handles API calls for jenis kelamin (gender) data in Pimpinan Dashboard
 */
class ExecutiveJenisKelaminService {
  /**
   * Get jenis kelamin data at university level (per fakultas)
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getJenisKelaminFakultas(
    params?: GetJenisKelaminFakultasParams,
  ): Promise<JenisKelaminFakultas[]> {
    const response = await executiveClient.get<{ data: JenisKelaminFakultas[] }>(
      "/dosen/jenis-kelamin/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get jenis kelamin data at fakultas level (per prodi)
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getJenisKelaminProdi(
    params: GetJenisKelaminProdiParams,
  ): Promise<JenisKelaminProdi[]> {
    const response = await executiveClient.get<{ data: JenisKelaminProdi[] }>(
      `/dosen/jenis-kelamin/fakultas/${params.idFakultas}`,
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
      "/dosen/jenis-kelamin/data",
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
      "/dosen/jenis-kelamin/master/tahun-ajaran",
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
    }>("/dosen/jenis-kelamin/master/fakultas");
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
    }>("/dosen/jenis-kelamin/master/prodi", {
      params,
    });
    return response.data.data || [];
  }

  /**
   * Get historical jenis kelamin data at university/fakultas level for multiple years
   * @param params - Optional query parameters (tahun_ajaran, fakultas_id)
   */
  async getJenisKelaminFakultasHistorical(
    params?: GetJenisKelaminFakultasHistoricalParams,
  ): Promise<TrendDataItem[]> {
    const response = await executiveClient.get<{ data: TrendDataItem[] }>(
      "/dosen/jenis-kelamin/fakultas/historical",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get historical jenis kelamin data at fakultas level (per prodi) for multiple years
   * @param params - Parameters including fakultas_id and optional tahun_ajaran, prodi_id
   */
  async getJenisKelaminProdiHistorical(
    params: GetJenisKelaminProdiHistoricalParams,
  ): Promise<TrendDataItem[]> {
    const response = await executiveClient.get<{ data: TrendDataItem[] }>(
      `/dosen/jenis-kelamin/fakultas/${params.fakultas_id}/historical`,
      {
        params: {
          tahun_ajaran: params.tahun_ajaran,
          prodi_id: params.prodi_id,
        },
      },
    );
    return response.data.data || [];
  }
}

export const executiveJenisKelaminService = new ExecutiveJenisKelaminService();
export default executiveJenisKelaminService;
