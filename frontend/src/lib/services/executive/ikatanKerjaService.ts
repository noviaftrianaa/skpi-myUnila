import { executiveClient } from "@/lib/api/executiveClient";

export interface TahunAjaran {
  id_thn_ajaran: string;
  nm_thn_ajaran: string;
}

export interface IkatanKerjaFakultas {
  id: string;
  nama_fakultas: string;
  dosen_tetap: number;
  dosen_pns_dpk: number;
  dokter_pendidik_klinis: number;
  dosen_tetap_bh: number;
  dosen_tidak_tetap: number;
  p3k_asn: number;
  dosen_perjanjian_kerja: number;
  instruktur: number;
  tutor: number;
  jft: number;
  pengajar_nondosen: number;
  dosen_tetap_pk_waktu_tertentu: number;
  belum_ikatan_kerja: number;
  total: number;
}

export interface IkatanKerjaProdi {
  id: string;
  nama_prodi: string;
  fakultas_id: string;
  nama_fakultas: string;
  dosen_tetap: number;
  dosen_pns_dpk: number;
  dokter_pendidik_klinis: number;
  dosen_tetap_bh: number;
  dosen_tidak_tetap: number;
  p3k_asn: number;
  dosen_perjanjian_kerja: number;
  instruktur: number;
  tutor: number;
  jft: number;
  pengajar_nondosen: number;
  dosen_tetap_pk_waktu_tertentu: number;
  belum_ikatan_kerja: number;
  total: number;
}

export interface Dosen {
  id: string;
  encrypted_id: string;
  nidn: string;
  nama: string;
  prodi: string;
  fakultas: string;
  ikatan_kerja: string;
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

export interface GetIkatanKerjaFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
}

export interface GetIkatanKerjaProdiParams {
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

export interface GetIkatanKerjaFakultasHistoricalParams {
  tahun_ajaran?: string;
  fakultas_id?: string;
  years_back?: number;
}

export interface GetIkatanKerjaProdiHistoricalParams {
  fakultas_id: string;
  tahun_ajaran?: string;
  prodi_id?: string;
  years_back?: number;
}

export interface HistoricalIkatanKerjaData {
  tahun: string;
  tahun_id: string;
  smt_id: string;
  data: IkatanKerjaFakultas[] | IkatanKerjaProdi[];
}

class ExecutiveIkatanKerjaService {
  async getIkatanKerjaFakultas(
    params?: GetIkatanKerjaFakultasParams,
  ): Promise<IkatanKerjaFakultas[]> {
    const response = await executiveClient.get<{ data: IkatanKerjaFakultas[] }>(
      "/dosen/ikatan-kerja/fakultas",
      {
        params,
      },
    );

    return response.data.data || [];
  }

  async getIkatanKerjaProdi(
    params: GetIkatanKerjaProdiParams,
  ): Promise<IkatanKerjaProdi[]> {
    const response = await executiveClient.get<{ data: IkatanKerjaProdi[] }>(
      `/dosen/ikatan-kerja/fakultas/${params.idFakultas}`,
      {
        params: {
          tahun_ajaran: params.tahun_ajaran,
        },
      },
    );

    return response.data.data || [];
  }

  async getDataDosen(
    params?: GetDataDosenParams,
  ): Promise<PaginationResponse<Dosen>> {
    const response = await executiveClient.get<PaginationResponse<Dosen>>(
      "/dosen/ikatan-kerja/data",
      {
        params,
      },
    );

    return response.data;
  }

  async getTahunAjaranList(): Promise<TahunAjaran[]> {
    const response = await executiveClient.get<{ data: TahunAjaran[] }>(
      "/dosen/ikatan-kerja/master/tahun-ajaran",
    );

    return response.data.data || [];
  }

  async getFakultasList(): Promise<Array<{ id: string; nama_fakultas: string }>> {
    const response = await executiveClient.get<{
      data: Array<{ id: string; nama_fakultas: string }>;
    }>("/dosen/ikatan-kerja/master/fakultas");

    return response.data.data || [];
  }

  async getProdiList(
    params: GetProdiParams,
  ): Promise<Array<{ id: string; nama_prodi: string }>> {
    const response = await executiveClient.get<{
      data: Array<{ id: string; nama_prodi: string }>;
    }>("/dosen/ikatan-kerja/master/prodi", {
      params,
    });

    return response.data.data || [];
  }

  /**
   * Get historical ikatan kerja fakultas data for the last N years
   * @param params - Parameters including tahun_ajaran, optional fakultas_id filter, and years_back (default: 5)
   */
  async getIkatanKerjaFakultasHistorical(
    params?: GetIkatanKerjaFakultasHistoricalParams,
  ): Promise<HistoricalIkatanKerjaData[]> {
    const response = await executiveClient.get<{ data: HistoricalIkatanKerjaData[] }>(
      "/dosen/ikatan-kerja/fakultas/historical",
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
   * Get historical ikatan kerja prodi data for the last N years
   * @param params - Parameters including fakultas_id, tahun_ajaran, optional prodi_id filter, and years_back (default: 5)
   */
  async getIkatanKerjaProdiHistorical(
    params: GetIkatanKerjaProdiHistoricalParams,
  ): Promise<HistoricalIkatanKerjaData[]> {
    const response = await executiveClient.get<{ data: HistoricalIkatanKerjaData[] }>(
      "/dosen/ikatan-kerja/prodi/historical",
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

export const executiveIkatanKerjaService = new ExecutiveIkatanKerjaService();
export default executiveIkatanKerjaService;
