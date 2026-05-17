/**
 * Me Service — endpoints owner-only di /api/v1/me/*
 * id_blog auto-resolved dari JWT (id_pengguna_pdut). Tidak perlu pass id_blog di payload.
 * Butuh login (Authorization: Bearer <token>).
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";
import type { Blog, Post, PostSummary } from "./types";

// =================== Blog (mine) ===================

export interface DailyViews {
  date: string;
  views: number;
}

export interface BlogTotals {
  views: number;
  likes: number;
  komentar: number;
  posts: number;
  followers: number;
}

export interface BlogWindowStat {
  views: number;
  likes: number;
  komentar: number;
}

export interface BlogTopPost {
  id_post: string;
  judul: string;
  slug: string;
  cover_url?: string | null;
  status: string;
  tgl_terbit?: string | null;
  window_views: number;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
}

export interface BlogReferrer {
  host: string;
  views: number;
}

export interface BlogAnalyticsSummary {
  window_days: number;
  daily: DailyViews[];
  totals: BlogTotals;
  window: BlogWindowStat;
  previous: BlogWindowStat;
  top_posts: BlogTopPost[];
  top_referrers: BlogReferrer[];
}

export interface AuditEntry {
  id_jejak_audit: string;
  id_pengguna_pdut?: string;
  aksi: string;
  entitas: string;
  id_entitas?: string;
  detail_json: Record<string, unknown>;
  created_at: string;
}

export interface UpdateBlogProfileInput {
  nm_blog?: string;
  nm_tampilan?: string;
  tagline?: string;
  deskripsi?: string;     // long markdown for About page
  bio?: string;           // short, max 500 char
  lokasi?: string;
  avatar_url?: string;
  cover_url?: string;
  sosmed_json?: Record<string, string>;
  meta_seo_json?: Record<string, unknown>;
  theme_config_json?: Record<string, unknown>;
  bahasa?: string;
  timezone?: string;
}

export const meBlogService = {
  async getMine(): Promise<Blog> {
    const { data } = await blogClient.get<APIEnvelope<Blog>>("/me/blog");
    return data.data;
  },

  async updateMine(input: UpdateBlogProfileInput): Promise<Blog> {
    const { data } = await blogClient.put<APIEnvelope<Blog>>("/me/blog", input);
    return data.data;
  },

  async analyticsViews(days = 30): Promise<DailyViews[]> {
    const { data } = await blogClient.get<APIEnvelope<DailyViews[]>>("/me/blog/analytics/views", {
      params: { days },
    });
    return data.data;
  },

  async analyticsSummary(days = 30): Promise<BlogAnalyticsSummary> {
    const { data } = await blogClient.get<APIEnvelope<BlogAnalyticsSummary>>("/me/blog/analytics/summary", {
      params: { days },
    });
    return data.data;
  },

  async auditList(limit = 20): Promise<AuditEntry[]> {
    const { data } = await blogClient.get<APIEnvelope<AuditEntry[]>>("/me/audit", {
      params: { limit },
    });
    return data.data || [];
  },

  // Personalized feed — posts dari blog yang user follow.
  async feed(limit = 20, offset = 0): Promise<APIList<PostSummary>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<PostSummary>>>("/me/feed", {
      params: { limit, offset },
    });
    return data.data;
  },
};

// =================== Post Write (mine) ===================

export interface CreatePostInput {
  id_kategori_post?: string | null;
  judul: string;
  slug?: string;
  ringkasan?: string | null;
  konten_html?: string | null;
  konten_json?: string | null;       // TipTap JSON as string (backend parse via ::jsonb)
  cover_url?: string | null;
  visibilitas?: "public" | "unlisted" | "private" | "password";
  tags?: string[];                    // tag names/slugs — backend auto-create + sync junction
}

export interface UpdatePostInput {
  id_kategori_post?: string | null;
  judul?: string;
  slug?: string;
  ringkasan?: string | null;
  konten_html?: string | null;
  konten_json?: string | null;
  cover_url?: string | null;
  status?: "draft" | "review" | "published" | "scheduled" | "archived" | "trash";
  visibilitas?: "public" | "unlisted" | "private" | "password";
  tgl_jadwal?: string;
  tags?: string[];                    // pass to replace junction; omit to keep existing
}

export const mePostService = {
  async create(input: CreatePostInput): Promise<Post> {
    const { data } = await blogClient.post<APIEnvelope<Post>>("/me/blog/posts/", input);
    return data.data;
  },

  async update(id: string, input: UpdatePostInput): Promise<Post> {
    const { data } = await blogClient.put<APIEnvelope<Post>>(`/me/blog/posts/${id}`, input);
    return data.data;
  },

  async publish(id: string): Promise<Post> {
    const { data } = await blogClient.post<APIEnvelope<Post>>(`/me/blog/posts/${id}/publish`);
    return data.data;
  },

  async toggleAuthorPin(id: string): Promise<{ a_unggulan_blog: boolean }> {
    const { data } = await blogClient.patch<APIEnvelope<{ a_unggulan_blog: boolean }>>(
      `/me/blog/posts/${id}/pin`
    );
    return data.data;
  },

  async softDelete(id: string): Promise<void> {
    await blogClient.delete(`/me/blog/posts/${id}`);
  },

  async listRevisions(idPost: string): Promise<PostRevisionSummary[]> {
    const { data } = await blogClient.get<APIEnvelope<PostRevisionSummary[]>>(
      `/me/blog/posts/${idPost}/revisions`
    );
    return data.data;
  },

  async getRevision(idPost: string, nomor: number): Promise<PostRevision> {
    const { data } = await blogClient.get<APIEnvelope<PostRevision>>(
      `/me/blog/posts/${idPost}/revisions/${nomor}`
    );
    return data.data;
  },

  async analytics(idPost: string, days = 30): Promise<PostAnalytics> {
    const { data } = await blogClient.get<APIEnvelope<PostAnalytics>>(
      `/me/blog/posts/${idPost}/analytics`,
      { params: { days } }
    );
    return data.data;
  },

  async listTrash(limit = 20, offset = 0): Promise<APIList<PostSummary>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<PostSummary>>>(
      "/me/blog/posts/trash",
      { params: { limit, offset } }
    );
    return data.data;
  },

  async restore(idPost: string): Promise<Post> {
    const { data } = await blogClient.post<APIEnvelope<Post>>(`/me/blog/posts/${idPost}/restore`);
    return data.data;
  },

  async permanentDelete(idPost: string): Promise<void> {
    await blogClient.delete(`/me/blog/posts/${idPost}/permanent`);
  },
};

export interface PostAnalyticsDaily {
  date: string;
  views: number;
}

export interface PostAnalyticsReferrer {
  host: string;
  views: number;
}

export interface PostAnalytics {
  daily: PostAnalyticsDaily[];
  referrers: PostAnalyticsReferrer[];
  total_views: number;
  unique_views: number;
  authed_views: number;
  window_days: number;
}

export interface PostRevisionSummary {
  id_post_revision: string;
  id_post: string;
  nomor_revisi: number;
  judul_snapshot: string;
  ringkasan_snapshot?: string;
  catatan?: string;
  id_creator: string;
  created_at: string;
}

export interface PostRevision extends PostRevisionSummary {
  konten_html_snapshot?: string;
  konten_json_snapshot?: object;
}
