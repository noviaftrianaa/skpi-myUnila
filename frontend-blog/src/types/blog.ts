// Type definitions matching blog_unila schema
// (subset untuk frontend — kolom yang dipakai render UI)

export type TipeRole = "MHS" | "STAF" | "DOSEN" | "ALUMNI";

export type PostStatus = "draft" | "review" | "published" | "scheduled" | "archived" | "trash";
export type PostVisibility = "public" | "unlisted" | "private" | "password";

export interface Kategori {
  id_kategori_post: string;
  slug: string;
  nm_kategori: string;
  deskripsi?: string | null;
  icon_name?: string | null;
  warna?: string | null;
  jumlah_post: number;
}

export interface Tag {
  id_tag: string;
  slug: string;
  nm_tag: string;
  deskripsi?: string | null;
  frekuensi: number;
  a_aktif?: boolean;
  created_at?: string;
}

export interface Author {
  id_blog: string;
  subdomain: string;
  nm_blog: string;
  nm_tampilan: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  tagline?: string | null;
  lokasi?: string | null;
  fakultas?: string | null;
  prodi?: string | null;
  tipe_role: TipeRole;
  a_terverifikasi: boolean;
  jumlah_post: number;
  jumlah_view: number;
  jumlah_follower: number;
  jumlah_like_total?: number;        // sum of likes across all posts
  rating_avg?: number;               // 0.00 - 5.00
  rating_count?: number;
  skor_seo?: number;                 // composite ranking score (apex)
  member_sejak?: string;             // ISO date — "tahun bergabung"
  sosmed_json?: Record<string, string> | null;
  meta_seo_json?: Record<string, unknown> | null;
  cv_json?: CVData | null;
  theme_config_json?: ThemeConfig | null;
  kode_template?: string;
}

export interface CVData {
  pendidikan?: CVPendidikan[];
  pengalaman?: CVPengalaman[];
  skills?: CVSkill[];
  sertifikasi?: CVSertifikasi[];
  publikasi?: CVPublikasi[];
  bahasa?: CVBahasa[];
}

export interface CVPendidikan {
  jenjang: string;       // S3 / S2 / S1 / D4 / D3 / SMA / dll
  institusi: string;
  prodi?: string;
  tahun_mulai: number;
  tahun_selesai?: number | null;  // null = ongoing
  deskripsi?: string;
}

export interface CVPengalaman {
  posisi: string;
  organisasi: string;
  lokasi?: string;
  tahun_mulai: number;
  tahun_selesai?: number | null;
  deskripsi?: string;
}

export interface CVSkill {
  nm_skill: string;
  level?: 1 | 2 | 3 | 4 | 5;
  kategori?: string;
}

export interface CVSertifikasi {
  nm: string;
  issuer: string;
  tahun: number;
  url?: string;
}

export interface CVPublikasi {
  judul: string;
  venue?: string;
  tahun: number;
  url?: string;
}

export interface CVBahasa {
  nm: string;
  level: "basic" | "intermediate" | "advanced" | "native";
}

export interface ThemeConfig {
  warna_primer?: string;
  warna_sekunder?: string;
  warna_aksen?: string;
  font_heading?: string;
  font_body?: string;
  layout?: "single-column" | "sidebar-right" | "sidebar-left";
  hero_style?: string;
  post_card_style?: string;
}

export interface Post {
  id_post: string;
  id_blog: string;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  konten_html?: string | null;
  cover_url?: string | null;
  status: PostStatus;
  visibilitas: PostVisibility;
  tgl_terbit?: string | null;
  a_pinned: boolean;
  a_unggulan: boolean;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
  jumlah_share: number;
  waktu_baca_menit: number;
  jumlah_kata: number;
  bahasa: string;
  kategori?: Kategori | null;
  tags?: Tag[];
  author?: Author;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more?: boolean;
}
