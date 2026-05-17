/**
 * Reading Progress Service — per-user scroll position + Continue Reading widget.
 * Backend storage; localStorage fallback handled by the public frontend.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface ReadingProgressItem {
  id_post: string;
  judul: string;
  slug: string;
  subdomain: string;
  nm_blog: string;
  nm_tampilan?: string | null;
  cover_url?: string | null;
  waktu_baca_menit: number;
  progress_pct: number;
  completed_at?: string | null;
  last_seen_at: string;
}

export const meReadingProgressService = {
  async listIncomplete(limit = 10): Promise<ReadingProgressItem[]> {
    const { data } = await blogClient.get<APIEnvelope<ReadingProgressItem[]>>(
      "/me/reading-progress",
      { params: { status: "incomplete", limit } },
    );
    return data.data;
  },

  async listCompleted(limit = 10): Promise<ReadingProgressItem[]> {
    const { data } = await blogClient.get<APIEnvelope<ReadingProgressItem[]>>(
      "/me/reading-progress",
      { params: { status: "completed", limit } },
    );
    return data.data;
  },
};
