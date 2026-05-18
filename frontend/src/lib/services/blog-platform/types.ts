// Types — match struct dari backend blog-service.
// Kalau backend berubah, update sini juga.

export interface BlogSummary {
  id_blog: string;
  subdomain: string;
  nm_blog: string;
  nm_tampilan?: string | null;
  tagline?: string | null;
  avatar_url?: string | null;
  tipe_role_kode: "MHS" | "STAF" | "DOSEN" | "ALUMNI";
  jumlah_post: number;
  jumlah_view: number;
  jumlah_follower: number;
  a_terverifikasi: boolean;
  a_aktif: boolean;
  tgl_klaim?: string | null;
}

// Theme config (stored di blog.theme_config_json JSONB).
// Field-field ini di-pakai oleh tenant layout untuk inline CSS variables.
export interface BlogThemeConfig {
  warna_primer?: string;        // hex (mis. "#0B5EA8") — accent utama (link, button)
  warna_sekunder?: string;      // hex — secondary accent (hover)
  layout?: "default" | "minimal" | "magazine";
  font_judul?: "default" | "serif" | "mono" | "display";
  font_body?: "default" | "serif";
  dark_mode_default?: boolean;
}

// Blog-level SEO config (stored di blog.meta_seo_json JSONB).
// Field-field ini di-pakai untuk render <head> meta tags + OG/Twitter cards.
export interface BlogSEOConfig {
  title_template?: string;       // mis. "{title} - Catatan Mizar". {title} di-replace dengan post judul.
  description?: string;          // default meta description (kalau post gak punya ringkasan)
  keywords?: string;             // comma-separated default keywords
  og_image?: string;             // default Open Graph image URL
  twitter_handle?: string;       // @handle
  twitter_card?: "summary" | "summary_large_image";
  robots?: "index,follow" | "noindex,nofollow" | "index,nofollow" | "noindex,follow";
  canonical_base?: string;       // override canonical URL base (jarang dipakai)
}

export interface Blog {
  id_blog: string;
  id_pengguna_pdut: string;
  id_tipe_role: string;
  subdomain: string;
  nm_blog: string;
  nm_tampilan?: string | null;
  tagline?: string | null;
  deskripsi?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  lokasi?: string | null;
  sosmed_json: Record<string, string>;
  id_template_theme?: string | null;
  theme_config_json: BlogThemeConfig;
  meta_seo_json: BlogSEOConfig;
  bahasa: string;
  timezone: string;
  a_aktif: boolean;
  a_publik: boolean;
  a_komentar_aktif: boolean;
  a_terverifikasi: boolean;
  tgl_klaim?: string | null;
  jumlah_post: number;
  jumlah_view: number;
  jumlah_follower: number;
  rating_avg: number;
  rating_count: number;
  skor_seo: number;
  created_at: string;
  updated_at: string;
}

export type PostStatus = "draft" | "review" | "published" | "scheduled" | "archived" | "trash";
export type PostVisibilitas = "public" | "unlisted" | "private" | "password";

export interface PostSummary {
  id_post: string;
  id_blog: string;
  subdomain: string;
  nm_blog: string;
  blog_avatar_url?: string | null;
  id_kategori_post?: string | null;
  kategori_slug?: string | null;
  kategori_nama?: string | null;
  kategori_warna?: string | null;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  cover_url?: string | null;
  status: PostStatus;
  visibilitas: PostVisibilitas;
  tgl_terbit?: string | null;
  tgl_jadwal?: string | null;
  a_pinned: boolean;
  a_unggulan: boolean;
  a_unggulan_blog?: boolean;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
  waktu_baca_menit: number;
  bahasa: string; // Phase BD — promoted ke summary supaya filter list by bahasa cepat
  created_at: string;
}

export interface TagBrief {
  id_tag: string;
  slug: string;
  nm_tag: string;
}

export interface Post extends PostSummary {
  konten_html?: string | null;
  konten_json?: object | null;
  konten_md?: string | null;
  jumlah_share: number;
  jumlah_kata: number;
  meta_seo_json: Record<string, unknown>;
  id_pair_post?: string | null; // Phase BD — versi bahasa lain (kalau pair)
  updated_at: string;
  tags: TagBrief[];
}

export interface Kategori {
  id_kategori_post: string;
  slug: string;
  nm_kategori: string;
  deskripsi?: string | null;
  icon_name?: string | null;
  warna?: string | null;
  urutan: number;
  jumlah_post: number;
  a_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id_tag: string;
  slug: string;
  nm_tag: string;
  deskripsi?: string | null;
  frekuensi: number;
  a_aktif: boolean;
  created_at: string;
}

export interface PostStatusCount {
  status: PostStatus;
  total: number;
}
