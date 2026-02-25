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
}

export const executiveIkatanKerjaService = new ExecutiveIkatanKerjaService();
export default executiveIkatanKerjaService;
