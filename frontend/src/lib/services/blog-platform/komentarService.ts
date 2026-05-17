/**
 * Komentar Service — moderasi per-blog (owner only).
 * Public endpoints (list, create) di-handle oleh frontend-blog langsung.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface KomentarItem {
  id_komentar: string;
  id_post: string;
  id_komentar_parent?: string | null;
  id_pengguna_pdut?: string | null;
  nm_komentator?: string | null;
  email_komentator?: string | null;
  isi: string;
  status_moderasi: "pending" | "approved" | "spam" | "rejected";
  jumlah_like: number;
  a_pinned: boolean;
  created_at: string;
}

export type ModerationStatus = "pending" | "approved" | "spam" | "rejected";

export const meKomentarService = {
  async list(status: ModerationStatus = "pending"): Promise<KomentarItem[]> {
    const { data } = await blogClient.get<APIEnvelope<KomentarItem[]>>("/me/blog/komentar/", {
      params: { status },
    });
    return data.data || [];
  },

  async moderate(id: string, status: ModerationStatus): Promise<void> {
    await blogClient.patch(`/me/blog/komentar/${id}`, { status });
  },

  async moderateBulk(ids: string[], status: ModerationStatus): Promise<number> {
    const { data } = await blogClient.post<APIEnvelope<{ affected: number }>>(
      "/me/blog/komentar/bulk",
      { ids, status }
    );
    return data.data.affected;
  },

  async togglePin(id: string): Promise<boolean> {
    const { data } = await blogClient.patch<APIEnvelope<{ a_pinned: boolean }>>(
      `/me/blog/komentar/${id}/pin`
    );
    return data.data.a_pinned;
  },

  async softDelete(id: string): Promise<void> {
    await blogClient.delete(`/me/blog/komentar/${id}`);
  },

  async listTrash(limit = 50, offset = 0): Promise<KomentarItem[]> {
    const { data } = await blogClient.get<APIEnvelope<{ items: KomentarItem[]; total: number }>>(
      "/me/blog/komentar/trash",
      { params: { limit, offset } }
    );
    return data.data.items || [];
  },

  async restore(id: string): Promise<void> {
    await blogClient.post(`/me/blog/komentar/${id}/restore`);
  },

  async permanentDelete(id: string): Promise<void> {
    await blogClient.delete(`/me/blog/komentar/${id}/permanent`);
  },
};
