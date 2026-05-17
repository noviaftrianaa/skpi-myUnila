import { blogClient, type APIEnvelope } from "./blogClient";
import type { Tag } from "./types";

export const tagService = {
  async list(opts: { aktifOnly?: boolean; limit?: number } = {}): Promise<Tag[]> {
    const { data } = await blogClient.get<APIEnvelope<Tag[]>>("/tag", {
      params: {
        aktif: opts.aktifOnly === false ? "0" : "1",
        limit: opts.limit ?? 100,
      },
    });
    return data.data;
  },

  async search(q: string, limit = 10): Promise<Tag[]> {
    if (!q || q.length < 1) return [];
    const { data } = await blogClient.get<APIEnvelope<Tag[]>>("/tag/search", {
      params: { q, limit },
    });
    return data.data;
  },
};
