import { blogClient, type APIEnvelope } from "./blogClient";
import type { Kategori } from "./types";

export const kategoriService = {
  async list(aktifOnly = true): Promise<Kategori[]> {
    const { data } = await blogClient.get<APIEnvelope<Kategori[]>>("/kategori", {
      params: { aktif: aktifOnly ? "1" : "0" },
    });
    return data.data;
  },
};
