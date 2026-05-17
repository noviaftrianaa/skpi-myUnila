/**
 * Ban Service — admin moderation: block bad-actor users from engagement.
 * Banned users can still read (GET) but POST/PUT/DELETE/PATCH return 403.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface BanEntry {
  id_ban: string;
  id_pengguna_pdut: string;
  alasan: string;
  banned_at: string;
  banned_until?: string | null;
  id_banned_by: string;
  catatan_internal?: string | null;
  created_at: string;
  updated_at: string;
  soft_delete?: string | null;
  // Joined fields (from admin list endpoint)
  blog_subdomain?: string | null;
  blog_nm_blog?: string | null;
  blog_avatar?: string | null;
}

export interface BanListResult {
  items: BanEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface BanCreateInput {
  id_pengguna_pdut: string;
  alasan: string;
  banned_until?: string | null; // RFC3339 or null/undefined = permanent
  catatan_internal?: string | null;
}

export const adminBanService = {
  async list(activeOnly = true, limit = 30, offset = 0): Promise<BanListResult> {
    const { data } = await blogClient.get<APIEnvelope<BanListResult>>("/admin/bans/", {
      params: { active: activeOnly ? "true" : "false", limit, offset },
    });
    return data.data;
  },

  async create(input: BanCreateInput): Promise<BanEntry> {
    const { data } = await blogClient.post<APIEnvelope<BanEntry>>("/admin/bans/", input);
    return data.data;
  },

  async unban(idBan: string): Promise<void> {
    await blogClient.delete(`/admin/bans/${idBan}`);
  },
};
