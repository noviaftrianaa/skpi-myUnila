/**
 * Banned Commenter Service — per-blog commenter ban (Phase BF).
 *
 * Beda dengan banService (Phase AO): banService = admin platform, ban global
 * dari semua aksi engagement lintas blog. bannedCommenterService = blog owner,
 * ban specific user dari komentar di blog miliknya saja.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface BannedCommenter {
  id_banned_commenter: string;
  id_blog: string;
  id_pengguna_pdut: string;
  alasan: string;
  dibanned_oleh: string;
  dibanned_pada: string;
  // Joined fields
  nm_komentator?: string | null;
  blog_subdomain?: string | null;
  blog_avatar?: string | null;
}

export interface BannedCommenterListResult {
  items: BannedCommenter[];
  total: number;
  limit: number;
  offset: number;
}

export interface BanCommenterInput {
  /** Berikan salah satu: id_pengguna_pdut (langsung) atau id_komentar (resolve user dari komentar) */
  id_pengguna_pdut?: string;
  id_komentar?: string;
  alasan: string;
}

export const bannedCommenterService = {
  async list(limit = 50, offset = 0): Promise<BannedCommenterListResult> {
    const { data } = await blogClient.get<APIEnvelope<BannedCommenterListResult>>(
      "/me/blog/banned-commenter/",
      { params: { limit, offset } },
    );
    return data.data;
  },

  async ban(input: BanCommenterInput): Promise<BannedCommenter> {
    const { data } = await blogClient.post<APIEnvelope<BannedCommenter>>(
      "/me/blog/banned-commenter/",
      input,
    );
    return data.data;
  },

  async unban(id: string): Promise<void> {
    await blogClient.delete(`/me/blog/banned-commenter/${id}`);
  },
};
