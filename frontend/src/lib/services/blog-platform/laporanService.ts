/**
 * Laporan Service — admin moderation untuk report inappropriate post.
 * Backend: /api/v1/admin/laporan (admin role required).
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export type LaporanStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface LaporanEntry {
  id_laporan_post: string;
  id_post: string;
  id_pelapor_pdut?: string;
  alasan: string;
  detail?: string;
  status: LaporanStatus;
  tindakan?: string;
  id_moderator_pdut?: string;
  tgl_diputuskan?: string;
  created_at: string;
  updated_at: string;
  // Joined from post + blog
  post_judul: string;
  post_slug: string;
  post_status: string;
  post_ringkasan?: string;
  blog_subdomain: string;
  blog_nama: string;
}

export interface LaporanListResult extends APIList<LaporanEntry> {
  count_status: Record<LaporanStatus, number>;
}

export interface ModerateInput {
  status: Exclude<LaporanStatus, "pending">;
  tindakan?: string;
}

export const adminLaporanService = {
  async list(status?: LaporanStatus, limit = 20, offset = 0): Promise<LaporanListResult> {
    const { data } = await blogClient.get<APIEnvelope<LaporanListResult>>("/admin/laporan/", {
      params: { status, limit, offset },
    });
    return data.data;
  },
  async moderate(idLaporan: string, input: ModerateInput): Promise<void> {
    await blogClient.patch(`/admin/laporan/${idLaporan}`, input);
  },
};
