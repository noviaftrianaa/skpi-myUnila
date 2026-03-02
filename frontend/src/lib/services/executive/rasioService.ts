import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_smt: string;
  nm_smt: string;
}

export interface Fakultas {
  id: string;
  nama_fakultas: string;
  total_dosen: number;
  total_mahasiswa: number;
  rasio: string;
}

export interface Prodi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  jumlah_dosen: number;
  jumlah_mahasiswa: number;
  rasio: string;
}

export interface Mahasiswa {
  id: string;
  encrypted_id: string;
  nim: string;
  nama: string;
  prodi: string;
  fakultas: string;
  angkatan: string;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
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

export interface GetFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetProdiParams {
  idFakultas: string;
  tahun_ajaran?: string;
}

export interface GetDataMahasiswaParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
  prodi_id?: string;
  per_page?: number;
  page?: number;
  search?: string;
}

export interface GetDataDosenParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
  prodi_id?: string;
  per_page?: number;
  page?: number;
  search?: string;
}

export interface GetRasioFakultasHistoricalParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
  years_back?: number;
}

export interface GetRasioProdiHistoricalParams {
  fakultas_id: string;
  tahun_ajaran?: string;
  prodi_id?: string;
  years_back?: number;
}

export interface HistoricalRasioData {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Fakultas[];
}

export interface HistoricalRasioProdiData {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: Prodi[];
}

// ========================================
// Service
// ========================================

/**
 * Executive Rasio Service
 *
 * Handles API calls for rasio (dosen-mahasiswa ratio) data in Pimpinan Dashboard
 */
class ExecutiveRasioService {
  /**
   * Get all fakultas data with rasio
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getFakultas(params?: GetFakultasParams): Promise<Fakultas[]> {
    const response = await executiveClient.get<{ data: Fakultas[] }>(
      "/rasio/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get prodi list by fakultas ID with rasio
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getProdiByFakultas(params: GetProdiParams): Promise<Prodi[]> {
    const response = await executiveClient.get<{ data: Prodi[] }>(
      `/rasio/fakultas/${params.idFakultas}`,
      {
        params: {
          tahun_ajaran: params.tahun_ajaran,
        },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get mahasiswa data with pagination
   * @param params - Query parameters (tahun_ajaran, fakultas_id, per_page, page)
   */
  async getDataMahasiswa(
    params?: GetDataMahasiswaParams,
  ): Promise<PaginationResponse<Mahasiswa>> {
    const response = await executiveClient.get<PaginationResponse<Mahasiswa>>(
      "/rasio/data/mahasiswa",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get dosen data with pagination
   * @param params - Query parameters (tahun_ajaran, fakultas_id, per_page, page)
   */
  async getDataDosen(
    params?: GetDataDosenParams,
  ): Promise<PaginationResponse<Dosen>> {
    const response = await executiveClient.get<PaginationResponse<Dosen>>(
      "/rasio/data/dosen",
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
      "/rasio/master/tahun-ajaran",
    );
    return response.data.data || [];
  }

  /**
   * Get fakultas list (master data)
   */
  async getFakultasList(): Promise<Fakultas[]> {
    const response = await executiveClient.get<{ data: Fakultas[] }>(
      "/rasio/master/fakultas",
    );
    return response.data.data || [];
  }

  /**
   * Get historical rasio fakultas data for the last N years
   * @param params - Parameters including tahun_ajaran, optional fakultas_id filter, and years_back (default: 5)
   */
  async getRasioFakultasHistorical(
    params?: GetRasioFakultasHistoricalParams,
  ): Promise<HistoricalRasioData[]> {
    const response = await executiveClient.get<{ data: HistoricalRasioData[] }>(
      "/rasio/fakultas/historical",
      {
        params: {
          tahun_ajaran: params?.tahun_ajaran,
          fakultas_id: params?.fakultas_id,
          years_back: params?.years_back ?? 5,
        },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get historical rasio prodi data for the last N years
   * @param params - Parameters including fakultas_id, tahun_ajaran, optional prodi_id filter, and years_back (default: 5)
   */
  async getRasioProdiHistorical(
    params: GetRasioProdiHistoricalParams,
  ): Promise<HistoricalRasioProdiData[]> {
    const response = await executiveClient.get<{ data: HistoricalRasioProdiData[] }>(
      "/rasio/prodi/historical",
      {
        params: {
          fakultas_id: params.fakultas_id,
          tahun_ajaran: params.tahun_ajaran,
          prodi_id: params.prodi_id,
          years_back: params.years_back ?? 5,
        },
      },
    );
    return response.data.data || [];
  }
}

export const executiveRasioService = new ExecutiveRasioService();
export default executiveRasioService;
