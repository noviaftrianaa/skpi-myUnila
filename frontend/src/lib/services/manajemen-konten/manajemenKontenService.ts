/**
 * Manajemen Konten Service — Frontend client untuk service Go
 * (backend: backend/manajemen-konten-service di port 8090, di Kong route /man-konten-service).
 */

import axios from "axios";
import { getToken } from "@/lib/api/client";

// Base URL: Kong route + service prefix
const BASE_URL =
  process.env.NEXT_PUBLIC_MAN_KONTEN_API_URL ||
  `${process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:9800"}/man-konten-service/api/v1`;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

client.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ============ Types ============

export interface Kategori {
  id_kategori: string;
  kode: string;
  nama: string;
  icon_name?: string | null;
  color?: string | null;
  jenis: "pengumuman" | "berita" | "both";
  urutan: number;
  is_active: boolean;
  create_date?: string | null;
  last_update?: string | null;
}

export type KontenTipe = "pengumuman" | "berita" | "artikel";
export type KontenStatus = "draft" | "published" | "archived";

export interface Konten {
  id_pengumuman: string;
  tipe: KontenTipe;
  judul: string;
  slug?: string | null;
  ringkasan?: string | null;
  isi?: string | null;
  id_kategori?: string | null;
  nama_kategori?: string | null;
  icon_kategori?: string | null;
  color_kategori?: string | null;
  banner_url?: string | null;
  author?: string | null;
  tags?: string | null;
  is_pinned: boolean;
  is_featured: boolean;
  tgl_terbit: string;
  tgl_expiry?: string | null;
  status: KontenStatus;
  target_role: string;
  view_count: number;
  allow_comment: boolean;
  allow_like: boolean;
  create_date?: string | null;
  last_update?: string | null;
}

export interface KontenListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CreateKontenPayload {
  tipe?: KontenTipe;
  judul: string;
  slug?: string | null;
  ringkasan?: string | null;
  isi?: string | null;
  id_kategori?: string | null;
  banner_url?: string | null;
  author?: string | null;
  tags?: string | null;
  is_pinned?: boolean;
  is_featured?: boolean;
  tgl_terbit?: string | null;
  tgl_expiry?: string | null;
  status?: KontenStatus;
  target_role?: string;
  allow_comment?: boolean;
  allow_like?: boolean;
}

export type UpdateKontenPayload = Partial<CreateKontenPayload>;

// ============ API methods ============

const manajemenKontenService = {
  // Kategori
  async listKategori(jenis?: string, isActive?: boolean) {
    const params: any = {};
    if (jenis) params.jenis = jenis;
    if (isActive !== undefined) params.is_active = isActive;
    const r = await client.get("/kategori", { params });
    return r.data as { success: boolean; data: Kategori[] };
  },

  async createKategori(payload: Omit<Kategori, "id_kategori" | "create_date" | "last_update">) {
    const r = await client.post("/kategori", payload);
    return r.data;
  },

  async updateKategori(id: string, payload: Partial<Kategori>) {
    const r = await client.put(`/kategori/${id}`, payload);
    return r.data;
  },

  async deleteKategori(id: string) {
    const r = await client.delete(`/kategori/${id}`);
    return r.data;
  },

  // Konten (pengumuman/berita/artikel)
  async listKonten(params: {
    page?: number;
    limit?: number;
    search?: string;
    tipe?: KontenTipe | "";
    id_kategori?: string;
    status?: KontenStatus | "";
    target_role?: string;
  } = {}) {
    const r = await client.get("/pengumuman", { params });
    return r.data as { success: boolean; data: Konten[]; meta: KontenListMeta };
  },

  async getKonten(id: string, trackView = false) {
    const r = await client.get(`/pengumuman/${id}`, { params: { track_view: trackView } });
    return r.data as { success: boolean; data: Konten };
  },

  async getKontenBySlug(slug: string, trackView = false) {
    const r = await client.get(`/pengumuman/slug/${slug}`, { params: { track_view: trackView } });
    return r.data as { success: boolean; data: Konten };
  },

  async dashboardKonten(tipe?: KontenTipe, limit = 5) {
    const r = await client.get("/pengumuman/dashboard", { params: { tipe, limit } });
    return r.data as { success: boolean; data: Konten[] };
  },

  async createKonten(payload: CreateKontenPayload) {
    const r = await client.post("/pengumuman", payload);
    return r.data as { success: boolean; data: { id_pengumuman: string } };
  },

  async updateKonten(id: string, payload: UpdateKontenPayload) {
    const r = await client.put(`/pengumuman/${id}`, payload);
    return r.data;
  },

  async updateStatus(id: string, status: KontenStatus) {
    const r = await client.patch(`/pengumuman/${id}/status`, { status });
    return r.data;
  },

  async deleteKonten(id: string) {
    const r = await client.delete(`/pengumuman/${id}`);
    return r.data;
  },
};

export default manajemenKontenService;
