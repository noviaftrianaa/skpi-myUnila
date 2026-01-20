import { executiveClient } from "@/lib/api/executiveClient";

// Types based on the akreditasi page data structure
export interface JenjangProdi {
  jenjang: string;
  jumlah: number;
}

export interface JenjangList {
  D3: string;
  D4: string;
  S1: string;
  S2: string;
  S3: string;
  Profesi: string;
  "Sp-1": string;
  "Sp-2": string;
}

export interface Fakultas {
  id: string;
  nama_lembaga: string;
  total_prodi: string;
  jenjang_list: JenjangList;
  prodi_aktif: number;
  jumlah_prodi_reakreditasi: number;
}

export interface Prodi {
  id: string;
  nama_prodi: string;
  jenjang: string;
  akreditasi_terakhir: string;
  tahun_akreditasi: number;
  status_akreditasi:
    | "Unggul"
    | "Baik Sekali"
    | "Baik"
    | "A"
    | "B"
    | "C"
    | "Proses";
  tanggal_kadaluarsa: string;
  is_reakreditasi: boolean;
}

export interface AkreditasiSummary {
  total_fakultas: number;
  total_prodi_aktif: number;
  total_prodi_reakreditasi: number;
  total_jenjang_prodi: number;
}

export interface GetFakultasParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface GetProdiParams {
  fakultas_id: string;
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * Executive Akreditasi Service
 *
 * Handles API calls for akreditasi (accreditation) data in Pimpinan Dashboard
 */
class ExecutiveAkreditasiService {
  /**
   * Get all fakultas data
   * @param params - Optional query parameters (search, page, per_page)
   */
  async getAllFakultas(params?: GetFakultasParams) {
    const response = await executiveClient.get<{ data: Fakultas[] }>(
      "/akreditasi/fakultas",
      {
        params,
      },
    );
    return response.data.data || [];
  }

  /**
   * Get fakultas by ID
   * @param id - Fakultas ID
   */
  async getFakultasById(id: string): Promise<Fakultas> {
    const response = await executiveClient.get<{ data: Fakultas }>(
      `/akreditasi/fakultas/${id}`,
    );
    return response.data.data;
  }

  /**
   * Get prodi data by fakultas
   * @param params - Parameters including fakultas_id
   */
  async getProdiByFakultas(params: GetProdiParams): Promise<Prodi[]> {
    const response = await executiveClient.get<{ data: Prodi[] }>(
      `/akreditasi/fakultas/${params.fakultas_id}/prodi`,
      {
        params: {
          search: params.search,
          page: params.page,
          per_page: params.per_page,
        },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get prodi by ID
   * @param id - Prodi ID
   */
  async getProdiById(id: string): Promise<Prodi> {
    const response = await executiveClient.get<{ data: Prodi }>(
      `/akreditasi/prodi/${id}`,
    );
    return response.data.data;
  }

  /**
   * Get akreditasi summary statistics
   */
  async getAkreditasiSummary(): Promise<AkreditasiSummary> {
    const response = await executiveClient.get<{ data: AkreditasiSummary }>(
      "/akreditasi/summary",
    );
    return response.data.data;
  }

  /**
   * Search prodi by name or jenjang
   * @param query - Search query
   */
  async searchProdi(query: string): Promise<Prodi[]> {
    const response = await executiveClient.get<{ data: Prodi[] }>(
      "/akreditasi/prodi/search",
      {
        params: { q: query },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get prodi yang akan reakreditasi dalam periode tertentu
   * @param months - Number of months ahead to check (default: 6 months)
   */
  async getProdiReakreditasiSoon(months: number = 6): Promise<Prodi[]> {
    const response = await executiveClient.get<{ data: Prodi[] }>(
      "/akreditasi/prodi/reakreditasi",
      {
        params: { months },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get fakultas with most prodi reakreditasi
   * @param limit - Number of results to return (default: 5)
   */
  async getTopFakultasReakreditasi(limit: number = 5): Promise<Fakultas[]> {
    const response = await executiveClient.get<{ data: Fakultas[] }>(
      "/akreditasi/fakultas/top-reakreditasi",
      {
        params: { limit },
      },
    );
    return response.data.data || [];
  }

  /**
   * Get akreditasi status distribution
   */
  async getAkreditasiDistribution(): Promise<Record<string, number>> {
    const response = await executiveClient.get<{
      data: Record<string, number>;
    }>("/akreditasi/distribution");
    return response.data.data;
  }
}

export const executiveAkreditasiService = new ExecutiveAkreditasiService();
export default executiveAkreditasiService;
