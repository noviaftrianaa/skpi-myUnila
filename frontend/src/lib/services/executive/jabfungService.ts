import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface JabfungFakultas {
  id: string;
  nama_fakultas: string;
  belum_jabfung: number;
  asisten_ahli: number;
  lektor: number;
  lektor_kepala: number;
  profesor: number;
  total: number;
}

export interface JabfungProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  belum_jabfung: number;
  asisten_ahli: number;
  lektor: number;
  lektor_kepala: number;
  profesor: number;
  total: number;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  jabfung: string;
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

export interface GetJabfungFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetJabfungProdiParams {
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
 * Executive Jabfung Service
 *
 * Handles API calls for jabfung (functional position) data in Pimpinan Dashboard
 */
class ExecutiveJabfungService {
  /**
   * Get jabfung data at university level (per fakultas)
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getJabfungFakultas(
    params?: GetJabfungFakultasParams,
  ): Promise<JabfungFakultas[]> {
    const response = await executiveClient.get<{ data: JabfungFakultas[] }>(
      "/dosen/jabfung/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get jabfung data at fakultas level (per prodi)
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getJabfungProdi(
    params: GetJabfungProdiParams,
  ): Promise<JabfungProdi[]> {
    const response = await executiveClient.get<{ data: JabfungProdi[] }>(
      `/dosen/jabfung/fakultas/${params.idFakultas}`,
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
      "/dosen/jabfung/data",
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
      "/dosen/jabfung/master/tahun-ajaran",
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
    }>("/dosen/jabfung/master/fakultas");
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
    }>("/dosen/jabfung/master/prodi", {
      params,
    });
    return response.data.data || [];
  }
}

export const executiveJabfungService = new ExecutiveJabfungService();
export default executiveJabfungService;
