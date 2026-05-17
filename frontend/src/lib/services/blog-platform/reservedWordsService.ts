/**
 * Reserved Words Service — admin CRUD untuk ref.kata_terlarang.
 * Dipakai oleh subdomain claim Layer 2 validation.
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export type KataKategori = "system" | "role" | "brand" | "offensive";

export interface KataTerlarang {
  id_kata_terlarang: string;
  kata: string;
  kategori: KataKategori;
  keterangan?: string;
  created_at: string;
  updated_at: string;
}

export interface KataListResult extends APIList<KataTerlarang> {
  count_kategori: Record<KataKategori, number>;
}

export interface UpsertKataInput {
  kata: string;
  kategori: KataKategori;
  keterangan?: string;
}

export const adminReservedWordsService = {
  async list(params: { kategori?: KataKategori; search?: string; limit?: number; offset?: number } = {}): Promise<KataListResult> {
    const { data } = await blogClient.get<APIEnvelope<KataListResult>>("/admin/kata-terlarang/", {
      params: {
        kategori: params.kategori,
        search: params.search,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      },
    });
    return data.data;
  },
  async create(input: UpsertKataInput): Promise<KataTerlarang> {
    const { data } = await blogClient.post<APIEnvelope<KataTerlarang>>("/admin/kata-terlarang/", input);
    return data.data;
  },
  async update(id: string, input: UpsertKataInput): Promise<KataTerlarang> {
    const { data } = await blogClient.put<APIEnvelope<KataTerlarang>>(`/admin/kata-terlarang/${id}`, input);
    return data.data;
  },
  async delete(id: string): Promise<void> {
    await blogClient.delete(`/admin/kata-terlarang/${id}`);
  },
};
