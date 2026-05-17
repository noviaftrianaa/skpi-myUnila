/**
 * Admin Stats Service — platform overview metrics single endpoint.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface StatsCounts {
  blog_total: number;
  blog_aktif: number;
  blog_verified: number;
  blog_suspended: number;
  post_total: number;
  post_published: number;
  post_draft: number;
  post_scheduled: number;
  komentar_aktif: number;
  laporan_pending: number;
  total_view: number;
  total_like: number;
  total_follower: number;
  kata_terlarang: number;
  template_theme: number;
}

export interface TopBlogStat {
  subdomain: string;
  nm_blog: string;
  jumlah_view: number;
  jumlah_post: number;
  jumlah_follower: number;
}

export interface AdminStatsResult {
  counts: StatsCounts;
  top_blogs: TopBlogStat[];
}

export const adminStatsService = {
  async get(): Promise<AdminStatsResult> {
    const { data } = await blogClient.get<APIEnvelope<AdminStatsResult>>("/admin/stats");
    return data.data;
  },
};
