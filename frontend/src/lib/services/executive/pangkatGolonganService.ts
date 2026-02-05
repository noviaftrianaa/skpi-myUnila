import { executiveClient } from "@/lib/api/executiveClient";

// ========================================
// Types
// ========================================

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface PangkatGolonganFakultas {
  id: string;
  nama_fakultas: string;
  juru_muda: number;
  juru_muda_tk_1: number;
  juru: number;
  juru_tk_1: number;
  pengatur_muda: number;
  pengatur_muda_tk_1: number;
  pengatur: number;
  pengatur_tk_1: number;
  penata_muda: number;
  penata_muda_tk_1: number;
  penata: number;
  penata_tk_1: number;
  pembina: number;
  pembina_tk_1: number;
  pembina_utama_muda: number;
  pembina_utama_madya: number;
  pembina_utama: number;
  belum_pangkat_gol: number;
  total: number;
}

export interface PangkatGolonganProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  juru_muda: number;
  juru_muda_tk_1: number;
  juru: number;
  juru_tk_1: number;
  pengatur_muda: number;
  pengatur_muda_tk_1: number;
  pengatur: number;
  pengatur_tk_1: number;
  penata_muda: number;
  penata_muda_tk_1: number;
  penata: number;
  penata_tk_1: number;
  pembina: number;
  pembina_tk_1: number;
  pembina_utama_muda: number;
  pembina_utama_madya: number;
  pembina_utama: number;
  belum_pangkat_gol: number;
  total: number;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  pangkat_golongan: string;
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

export interface GetPangkatGolonganFakultasParams {
  tahun_ajaran?: string;
}

export interface GetPangkatGolonganProdiParams {
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
 * Executive Pangkat Golongan Service
 *
 * Handles API calls for pangkat golongan (rank/grade level) data in Pimpinan Dashboard
 */
class ExecutivePangkatGolonganService {
  /**
   * Get pangkat golongan data at university level (per fakultas)
   * @param params - Optional query parameters (tahun_ajaran)
   */
  async getPangkatGolonganFakultas(
    params?: GetPangkatGolonganFakultasParams,
  ): Promise<PangkatGolonganFakultas[]> {
    const response = await executiveClient.get<{ data: PangkatGolonganFakultas[] }>(
      "/dosen/pangkat-golongan/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get pangkat golongan data at fakultas level (per prodi)
   * @param params - Parameters including idFakultas and optional tahun_ajaran
   */
  async getPangkatGolonganProdi(
    params: GetPangkatGolonganProdiParams,
  ): Promise<PangkatGolonganProdi[]> {
    const response = await executiveClient.get<{ data: PangkatGolonganProdi[] }>(
      `/dosen/pangkat-golongan/fakultas/${params.idFakultas}`,
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
      "/dosen/pangkat-golongan/data",
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
      "/dosen/pangkat-golongan/master/tahun-ajaran",
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
    }>("/dosen/pangkat-golongan/master/fakultas");
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
    }>("/dosen/pangkat-golongan/master/prodi", {
      params,
    });
    return response.data.data || [];
  }
}

export const executivePangkatGolonganService = new ExecutivePangkatGolonganService();
export default executivePangkatGolonganService;
