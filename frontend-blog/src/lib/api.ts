// Fetch wrapper untuk blog-service API.
// Backend live: http://localhost:8091 (atau via Kong: http://localhost:9800/blog-service)
// Mock fallback: NEXT_PUBLIC_USE_MOCK=true

import * as mock from "./_mock";
import type { Author, Kategori, PaginatedResponse, Post, Tag, PostStatus, PostVisibility } from "@/types/blog";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://localhost:8091";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    next: { revalidate: 300, ...((init as { next?: { revalidate?: number } })?.next || {}) },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

// =====================================================
// Backend response shapes (mirror Go structs di blog-service)
// =====================================================

interface APIPostSummary {
  id_post: string;
  id_blog: string;
  subdomain: string;
  nm_blog: string;
  avatar_url?: string | null;
  id_kategori_post?: string | null;
  kategori_slug?: string | null;
  kategori_nama?: string | null;
  kategori_warna?: string | null;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  cover_url?: string | null;
  status: PostStatus;
  visibilitas: PostVisibility;
  tgl_terbit?: string | null;
  tgl_jadwal?: string | null;
  a_pinned: boolean;
  a_unggulan: boolean;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
  waktu_baca_menit: number;
  created_at: string;
}

interface APIPost extends APIPostSummary {
  konten_html?: string | null;
  konten_md?: string | null;
  jumlah_share: number;
  jumlah_kata: number;
  bahasa: string;
  id_pair_post?: string | null; // Phase BD — versi bahasa lain
  updated_at: string;
}

interface APIBlog {
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
  sosmed_json?: Record<string, string>;
  theme_config_json?: Record<string, unknown>;
  meta_seo_json?: Record<string, unknown>;
  bahasa: string;
  timezone: string;
  a_aktif: boolean;
  a_publik: boolean;
  a_terverifikasi: boolean;
  tgl_klaim?: string | null;
  jumlah_post: number;
  jumlah_view: number;
  jumlah_follower: number;
  rating_avg: number;
  rating_count: number;
  skor_seo: number;
  created_at: string;
}

interface APIList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// =====================================================
// Transformers: backend flat shape → frontend nested shape
// =====================================================

function toPost(p: APIPostSummary | APIPost): Post {
  const kategori: Kategori | null = p.id_kategori_post && p.kategori_slug
    ? {
        id_kategori_post: p.id_kategori_post,
        slug: p.kategori_slug,
        nm_kategori: p.kategori_nama || "",
        warna: p.kategori_warna,
        jumlah_post: 0,
      }
    : null;

  const author: Author | undefined = p.subdomain
    ? {
        id_blog: p.id_blog,
        subdomain: p.subdomain,
        nm_blog: p.nm_blog,
        nm_tampilan: p.nm_blog, // fallback, real value via getBlogBySubdomain
        avatar_url: p.avatar_url,
        tipe_role: "MHS", // unknown from summary, default
        a_terverifikasi: false,
        jumlah_post: 0,
        jumlah_view: 0,
        jumlah_follower: 0,
      }
    : undefined;

  return {
    id_post: p.id_post,
    id_blog: p.id_blog,
    judul: p.judul,
    slug: p.slug,
    ringkasan: p.ringkasan,
    konten_html: "konten_html" in p ? p.konten_html : null,
    cover_url: p.cover_url,
    status: p.status,
    visibilitas: p.visibilitas,
    tgl_terbit: p.tgl_terbit,
    a_pinned: p.a_pinned,
    a_unggulan: p.a_unggulan,
    jumlah_view: p.jumlah_view,
    jumlah_like: p.jumlah_like,
    jumlah_komentar: p.jumlah_komentar,
    jumlah_share: "jumlah_share" in p ? p.jumlah_share : 0,
    waktu_baca_menit: p.waktu_baca_menit,
    jumlah_kata: "jumlah_kata" in p ? p.jumlah_kata : 0,
    bahasa: "bahasa" in p ? p.bahasa : "id",
    id_pair_post: "id_pair_post" in p ? (p.id_pair_post ?? null) : null,
    kategori,
    author,
  };
}

function toAuthor(b: APIBlog, tipeRoleKode?: string): Author {
  return {
    id_blog: b.id_blog,
    subdomain: b.subdomain,
    nm_blog: b.nm_blog,
    nm_tampilan: b.nm_tampilan || b.nm_blog,
    avatar_url: b.avatar_url,
    cover_url: b.cover_url,
    bio: b.bio,
    tagline: b.tagline,
    lokasi: b.lokasi,
    tipe_role: (tipeRoleKode as Author["tipe_role"]) || "MHS",
    a_terverifikasi: b.a_terverifikasi,
    jumlah_post: b.jumlah_post,
    jumlah_view: b.jumlah_view,
    jumlah_follower: b.jumlah_follower,
    rating_avg: b.rating_avg,
    rating_count: b.rating_count,
    skor_seo: b.skor_seo,
    member_sejak: b.tgl_klaim || b.created_at,
    sosmed_json: b.sosmed_json,
    meta_seo_json: b.meta_seo_json,
    theme_config_json: b.theme_config_json as Author["theme_config_json"],
  };
}

function toPaginated<T>(api: APIList<T>): PaginatedResponse<T> {
  const page = Math.floor(api.offset / Math.max(api.limit, 1)) + 1;
  return {
    items: api.items,
    total: api.total,
    page,
    limit: api.limit,
    has_more: api.offset + api.items.length < api.total,
  };
}

// =====================================================
// Public — Apex Aggregator (blog.unila.ac.id)
// =====================================================

export async function getTrending(limit = 12): Promise<Post[]> {
  if (USE_MOCK) return mock.trending.slice(0, limit);
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?status=published&order=trending&limit=${limit}`);
  return data.items.map(toPost);
}

export async function getLatest(limit = 12, offset = 0): Promise<PaginatedResponse<Post>> {
  if (USE_MOCK) {
    const items = mock.latestPosts.slice(offset, offset + limit);
    return { items, total: mock.latestPosts.length, page: Math.floor(offset / limit) + 1, limit, has_more: offset + limit < mock.latestPosts.length };
  }
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?status=published&order=latest&limit=${limit}&offset=${offset}`);
  const mapped = toPaginated<APIPostSummary>(data);
  return { ...mapped, items: data.items.map(toPost) };
}

export async function getFeatured(limit = 5): Promise<Post[]> {
  if (USE_MOCK) return mock.featured.slice(0, limit);
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?status=published&unggulan=1&order=latest&limit=${limit}`);
  return data.items.map(toPost);
}

export async function getKategori(): Promise<Kategori[]> {
  if (USE_MOCK) return mock.kategoriList;
  return fetchJson<Kategori[]>(`/api/v1/kategori?aktif=1`);
}

export async function getTopTags(limit = 30): Promise<Tag[]> {
  if (USE_MOCK) return mock.topTags.slice(0, limit);
  return fetchJson<Tag[]>(`/api/v1/tag?limit=${limit}`);
}

export async function getTopAuthors(limit = 10): Promise<Author[]> {
  if (USE_MOCK) return mock.topAuthors.slice(0, limit);
  const data = await fetchJson<APIList<APIBlog>>(`/api/v1/blogs?order=popular&limit=${limit}`);
  return data.items.map(b => toAuthor(b));
}

// Featured Authors — verified-only (a_terverifikasi=TRUE), untuk carousel di apex.
// Fallback: kalau gak ada verified author, return empty array (component
// nge-hide section).
export async function getFeaturedAuthors(limit = 8): Promise<Author[]> {
  if (USE_MOCK) return mock.topAuthors.filter(a => a.a_terverifikasi).slice(0, limit);
  try {
    const data = await fetchJson<APIList<APIBlog>>(`/api/v1/blogs?verified=1&order=popular&limit=${limit}`);
    return data.items.map(b => toAuthor(b));
  } catch {
    return [];
  }
}

// Paginated authors browse (apex /penulis page).
export async function getAuthors(opts: {
  limit?: number;
  offset?: number;
  search?: string;
  role?: "MHS" | "STAF" | "DOSEN" | "ALUMNI" | "";
  order?: "popular" | "latest" | "alphabetical";
} = {}): Promise<PaginatedResponse<Author>> {
  if (USE_MOCK) {
    const items = mock.topAuthors.slice(0, opts.limit ?? 24);
    return { items, total: items.length, page: 1, limit: opts.limit ?? 24 };
  }
  const params = new URLSearchParams({
    aktif: "1",
    order: opts.order ?? "popular",
    limit: String(opts.limit ?? 24),
    offset: String(opts.offset ?? 0),
    ...(opts.search && { search: opts.search }),
    ...(opts.role && { role: opts.role }),
  });
  const data = await fetchJson<APIList<APIBlog>>(`/api/v1/blogs?${params}`);
  const mapped = toPaginated<APIBlog>(data);
  return { ...mapped, items: data.items.map(b => toAuthor(b)) };
}

// Meilisearch document — flat shape ke-render via mapper di bawah.
interface APISearchHit {
  id_post: string;
  id_blog: string;
  subdomain: string;
  nm_blog: string;
  nm_tampilan?: string;
  avatar_url?: string;
  judul: string;
  slug: string;
  ringkasan?: string;
  cover_url?: string;
  status: string;
  kategori_slug?: string;
  kategori_nama?: string;
  kategori_warna?: string;
  tags_csv?: string;
  tgl_terbit?: number; // unix seconds
  jumlah_view: number;
  jumlah_like: number;
  waktu_baca_menit: number;
}

interface APISearchEnvelope {
  hits: APISearchHit[];
  total: number;
  limit: number;
  offset: number;
  highlights?: Array<{ id_post: string; judul?: string; ringkasan?: string; konten_text?: string }>;
}

export interface SearchResult extends PaginatedResponse<Post> {
  highlights: Record<string, { judul?: string; ringkasan?: string; konten_text?: string }>;
}

function hitToPost(h: APISearchHit): Post {
  const kategori: Kategori | null = h.kategori_slug
    ? {
        id_kategori_post: "",
        slug: h.kategori_slug,
        nm_kategori: h.kategori_nama || "",
        warna: h.kategori_warna,
        jumlah_post: 0,
      }
    : null;
  const tags: Tag[] = h.tags_csv
    ? h.tags_csv
        .split(",")
        .filter(Boolean)
        .map((nm) => ({ id_tag: "", slug: nm.toLowerCase().replace(/\s+/g, "-"), nm_tag: nm, frekuensi: 0 }))
    : [];
  const author: Author = {
    id_blog: h.id_blog,
    subdomain: h.subdomain,
    nm_blog: h.nm_blog,
    nm_tampilan: h.nm_tampilan || h.nm_blog,
    avatar_url: h.avatar_url || null,
    // Not part of search index — assume staf/dosen as the safest neutral default.
    tipe_role: "STAF",
    a_terverifikasi: false,
    jumlah_post: 0,
    jumlah_view: 0,
    jumlah_follower: 0,
  };
  return {
    id_post: h.id_post,
    id_blog: h.id_blog,
    judul: h.judul,
    slug: h.slug,
    ringkasan: h.ringkasan || null,
    konten_html: null,
    cover_url: h.cover_url || null,
    status: h.status as Post["status"],
    visibilitas: "public",
    tgl_terbit: h.tgl_terbit ? new Date(h.tgl_terbit * 1000).toISOString() : null,
    a_pinned: false,
    a_unggulan: false,
    jumlah_view: h.jumlah_view,
    jumlah_like: h.jumlah_like,
    jumlah_komentar: 0,
    jumlah_share: 0,
    waktu_baca_menit: h.waktu_baca_menit,
    jumlah_kata: 0,
    bahasa: "id",
    kategori,
    tags,
    author,
  };
}

export async function searchPosts(
  q: string,
  opts?: { limit?: number; offset?: number; kategori?: string; subdomain?: string; sort?: "latest" | "trending" }
): Promise<SearchResult> {
  if (USE_MOCK) {
    const filtered = mock.allPosts.filter(p =>
      p.judul.toLowerCase().includes(q.toLowerCase()) ||
      (p.ringkasan || "").toLowerCase().includes(q.toLowerCase())
    );
    return { items: filtered, total: filtered.length, page: 1, limit: opts?.limit ?? 20, highlights: {} };
  }
  const params = new URLSearchParams({
    q,
    limit: String(opts?.limit ?? 20),
    offset: String(opts?.offset ?? 0),
    ...(opts?.kategori && { kategori: opts.kategori }),
    ...(opts?.subdomain && { subdomain: opts.subdomain }),
    ...(opts?.sort && { sort: opts.sort }),
  });
  const data = await fetchJson<APISearchEnvelope>(`/api/v1/search/posts?${params}`);
  const items = data.hits.map(hitToPost);
  const highlights: SearchResult["highlights"] = {};
  for (const h of data.highlights || []) {
    highlights[h.id_post] = { judul: h.judul, ringkasan: h.ringkasan, konten_text: h.konten_text };
  }
  return {
    items,
    total: data.total,
    page: Math.floor((data.offset || 0) / (data.limit || 20)) + 1,
    limit: data.limit,
    highlights,
  };
}

// =====================================================
// Public — Per-User Tenant ({subdomain}.blog.unila.ac.id)
// =====================================================

export async function getBlogBySubdomain(subdomain: string): Promise<Author | null> {
  if (USE_MOCK) return mock.findBlog(subdomain);
  try {
    const blog = await fetchJson<APIBlog>(`/api/v1/blogs/by-subdomain/${subdomain}`);
    return toAuthor(blog);
  } catch {
    return null;
  }
}

export async function getBlogPosts(subdomain: string, opts?: { limit?: number; offset?: number; kategori?: string; tag?: string }): Promise<PaginatedResponse<Post>> {
  if (USE_MOCK) {
    const blog = mock.findBlog(subdomain);
    if (!blog) return { items: [], total: 0, page: 1, limit: opts?.limit ?? 12 };
    const items = mock.allPosts.filter(p => p.author?.subdomain === subdomain);
    return { items, total: items.length, page: 1, limit: opts?.limit ?? 12 };
  }
  const params = new URLSearchParams({
    status: "published",
    subdomain,
    order: "latest",
    limit: String(opts?.limit ?? 12),
    offset: String(opts?.offset ?? 0),
    ...(opts?.kategori && { kategori: opts.kategori }),
  });
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?${params}`);
  const mapped = toPaginated<APIPostSummary>(data);
  return { ...mapped, items: data.items.map(toPost) };
}

export async function getBlogPostBySlug(subdomain: string, slug: string): Promise<Post | null> {
  if (USE_MOCK) return mock.allPosts.find(p => p.author?.subdomain === subdomain && p.slug === slug) ?? null;
  try {
    const p = await fetchJson<APIPost>(`/api/v1/posts/by-slug/${subdomain}/${slug}`);
    return toPost(p);
  } catch {
    return null;
  }
}

// Phase BD — fetch by id (untuk resolve pair language version).
// Pair-link arah dua, jadi cukup fetch by id_post + ambil subdomain/slug-nya
// untuk render <Link> ke versi bahasa lain.
export async function getPostById(idPost: string): Promise<Post | null> {
  if (USE_MOCK) return mock.allPosts.find(p => p.id_post === idPost) ?? null;
  try {
    const p = await fetchJson<APIPost>(`/api/v1/posts/${idPost}`);
    return toPost(p);
  } catch {
    return null;
  }
}

export async function getKategoriBySlug(slug: string): Promise<Kategori | null> {
  if (USE_MOCK) return mock.kategoriList.find(k => k.slug === slug) ?? null;
  const all = await getKategori();
  return all.find(k => k.slug === slug) ?? null;
}

export async function getPostsByKategori(slug: string, opts?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Post>> {
  if (USE_MOCK) {
    const items = mock.allPosts.filter(p => p.kategori?.slug === slug);
    return { items, total: items.length, page: 1, limit: opts?.limit ?? 12 };
  }
  const params = new URLSearchParams({
    status: "published",
    kategori: slug,
    order: "latest",
    limit: String(opts?.limit ?? 12),
    offset: String(opts?.offset ?? 0),
  });
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?${params}`);
  const mapped = toPaginated<APIPostSummary>(data);
  return { ...mapped, items: data.items.map(toPost) };
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  if (USE_MOCK) return mock.topTags.find(t => t.slug === slug) ?? null;
  try {
    return await fetchJson<Tag>(`/api/v1/tag/by-slug/${slug}`);
  } catch {
    return null;
  }
}

export async function getPostsByTag(slug: string, opts?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Post>> {
  if (USE_MOCK) {
    const items = mock.allPosts.filter(p => p.tags?.some(t => t.slug === slug));
    return { items, total: items.length, page: 1, limit: opts?.limit ?? 12 };
  }
  const params = new URLSearchParams({
    status: "published",
    tag: slug,
    order: "latest",
    limit: String(opts?.limit ?? 12),
    offset: String(opts?.offset ?? 0),
  });
  const data = await fetchJson<APIList<APIPostSummary>>(`/api/v1/posts?${params}`);
  const mapped = toPaginated<APIPostSummary>(data);
  return { ...mapped, items: data.items.map(toPost) };
}

// =====================================================
// Series (Phase AM)
// =====================================================

export interface PublicSeries {
  id_series: string;
  id_blog: string;
  judul: string;
  slug: string;
  deskripsi?: string | null;
  cover_url?: string | null;
  a_aktif: boolean;
  jumlah_post: number;
  created_at: string;
  updated_at: string;
}

export interface PublicSeriesPost {
  id_post: string;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  cover_url?: string | null;
  status: string;
  tgl_terbit?: string | null;
  urutan_series?: number | null;
  waktu_baca_menit: number;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
}

export interface PublicSeriesDetail {
  series: PublicSeries;
  posts: PublicSeriesPost[];
}

export interface PublicSeriesContext {
  series?: PublicSeries;
  prev?: PublicSeriesPost;
  next?: PublicSeriesPost;
  index: number;
  total: number;
  all?: PublicSeriesPost[];
}

export async function getSeriesList(subdomain: string): Promise<PublicSeries[]> {
  if (USE_MOCK) return [];
  try {
    return await fetchJson<PublicSeries[]>(`/api/v1/blogs/by-subdomain/${subdomain}/series`);
  } catch {
    return [];
  }
}

export async function getSeriesBySlug(subdomain: string, slug: string): Promise<PublicSeriesDetail | null> {
  if (USE_MOCK) return null;
  try {
    return await fetchJson<PublicSeriesDetail>(`/api/v1/blogs/by-subdomain/${subdomain}/series/${slug}`);
  } catch {
    return null;
  }
}

export async function getSeriesContextForPost(idPost: string): Promise<PublicSeriesContext | null> {
  if (USE_MOCK) return null;
  try {
    return await fetchJson<PublicSeriesContext>(`/api/v1/posts/${idPost}/series-context`);
  } catch {
    return null;
  }
}

// =====================================================
// Co-authors (Phase AN)
// =====================================================

export interface PublicCoAuthor {
  id_blog_co: string;
  subdomain: string;
  nm_tampilan: string;
  nm_blog: string;
  avatar_url?: string | null;
  peran: "co_author" | "editor" | "reviewer" | "kontributor";
  urutan: number;
  catatan?: string | null;
  created_at: string;
}

export const CO_AUTHOR_LABEL: Record<PublicCoAuthor["peran"], string> = {
  co_author: "Co-author",
  editor: "Editor",
  reviewer: "Reviewer",
  kontributor: "Kontributor",
};

export async function getCoAuthorsForPost(idPost: string): Promise<PublicCoAuthor[]> {
  if (USE_MOCK) return [];
  try {
    return await fetchJson<PublicCoAuthor[]>(`/api/v1/posts/${idPost}/co-authors`);
  } catch {
    return [];
  }
}

// =====================================================
// Related posts (Phase AQ — Meilisearch-backed)
// =====================================================

export async function getRelatedPosts(idPost: string, limit = 5): Promise<Post[]> {
  if (USE_MOCK) return [];
  try {
    interface RelatedEnvelope { hits: APISearchHit[]; total: number; limit: number }
    const data = await fetchJson<RelatedEnvelope>(`/api/v1/posts/${idPost}/related?limit=${limit}`);
    return (data.hits || []).map(hitToPost);
  } catch {
    return [];
  }
}

// =====================================================
// Pinned posts per blog (Phase AW — author-curated)
// =====================================================

export async function getPinnedPosts(subdomain: string): Promise<Post[]> {
  if (USE_MOCK) return [];
  try {
    const data = await fetchJson<APIPostSummary[]>(`/api/v1/blogs/by-subdomain/${subdomain}/pinned`);
    return data.map(toPost);
  } catch {
    return [];
  }
}

// =====================================================
// Phase BB — Newsletter subscribe (public, no auth)
// =====================================================

export interface SubscribeResult {
  status: "pending_confirmation" | "already_confirmed" | "resent";
  message: string;
}

export async function subscribeToBlog(subdomain: string, email: string): Promise<SubscribeResult> {
  const res = await fetch(`${API_BASE}/api/v1/blogs/by-subdomain/${subdomain}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Subscribe failed (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export interface ConfirmResult {
  id_blog: string;
  email: string;
  status: string;
}

export async function confirmSubscribe(token: string): Promise<ConfirmResult> {
  return fetchJson<ConfirmResult>(`/api/v1/blogs/subscribe/confirm/${token}`);
}

export async function unsubscribe(token: string): Promise<ConfirmResult> {
  return fetchJson<ConfirmResult>(`/api/v1/blogs/subscribe/unsubscribe/${token}`);
}
