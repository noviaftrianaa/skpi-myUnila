import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface StatusKepegawaianFakultas {
  id: string;
  nama_fakultas: string;
  pns: number;
  cpns: number;
  pppk: number;
  non_asn: number;
  asn_jf_non_dosen: number;
  dokter_pendidik_klinis: number;
  lainnya: number;
  total: number;
}

export interface StatusKepegawaianProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  pns: number;
  cpns: number;
  pppk: number;
  non_asn: number;
  asn_jf_non_dosen: number;
  dokter_pendidik_klinis: number;
  lainnya: number;
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
  status_kepegawaian: string;
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

export interface GetStatusKepegawaianFakultasParams {
  tahun_ajaran?: string;
}

export interface GetStatusKepegawaianProdiParams {
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

// ========================================
// Service
// ========================================

/**
 * Executive Status Kepegawaian Service
 *
 * Handles API calls for status kepegawaian (employment status) data in Pimpinan Dashboard
 */
class ExecutiveStatusKepegawaianService {
  /**
   * Get status kepegawaian data at university level (per fakultas)
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getStatusKepegawaianFakultas(
    params?: GetStatusKepegawaianFakultasParams,
  ): Promise<StatusKepegawaianFakultas[]> {
    const response = await executiveClient.get<{ data: StatusKepegawaianFakultas[] }>(
      "/dosen/status-kepegawaian/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get status kepegawaian data at fakultas level (per prodi)
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getStatusKepegawaianProdi(
    params: GetStatusKepegawaianProdiParams,
  ): Promise<StatusKepegawaianProdi[]> {
    const response = await executiveClient.get<{ data: StatusKepegawaianProdi[] }>(
      `/dosen/status-kepegawaian/fakultas/${params.idFakultas}`,
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
      "/dosen/status-kepegawaian/data",
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
      "/dosen/status-kepegawaian/master/tahun-ajaran",
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
    }>("/dosen/status-kepegawaian/master/fakultas");
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
    }>("/dosen/status-kepegawaian/master/prodi", {
      params,
    });
    return response.data.data || [];
  }
}

export const executiveStatusKepegawaianService = new ExecutiveStatusKepegawaianService();
export default executiveStatusKepegawaianService;
