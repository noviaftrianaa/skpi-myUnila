/**
 * Admin Write Service — CRUD endpoints di blog-service /api/v1/admin/*
 * Butuh JWT dengan role Administrator atau Developer.
 * Token attached automatically via blogClient interceptor (read dari localStorage).
 */
import { blogClient, type APIEnvelope } from "./blogClient";
import type { Kategori, Tag, Post } from "./types";

// =================== Kategori Admin ===================

export interface KategoriUpsertInput {
  slug?: string;
  nm_kategori: string;
  deskripsi?: string | null;
  icon_name?: string | null;
  warna?: string | null;
  urutan?: number;
  a_aktif?: boolean;
}

export const adminKategoriService = {
  async create(input: KategoriUpsertInput): Promise<Kategori> {
    const payload = { urutan: 0, a_aktif: true, ...input };
    const { data } = await blogClient.post<APIEnvelope<Kategori>>("/admin/kategori/", payload);
    return data.data;
  },

  async update(id: string, input: KategoriUpsertInput): Promise<Kategori> {
    const payload = { urutan: 0, a_aktif: true, ...input };
    const { data } = await blogClient.put<APIEnvelope<Kategori>>(`/admin/kategori/${id}`, payload);
    return data.data;
  },

  async toggleAktif(id: string): Promise<Kategori> {
    const { data } = await blogClient.patch<APIEnvelope<Kategori>>(`/admin/kategori/${id}/toggle-aktif`);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await blogClient.delete(`/admin/kategori/${id}`);
  },
};

// =================== Tag Admin ===================

export interface TagUpsertInput {
  slug?: string;
  nm_tag: string;
  deskripsi?: string | null;
  a_aktif?: boolean;
}

export const adminTagService = {
  async create(input: TagUpsertInput): Promise<Tag> {
    const payload = { a_aktif: true, ...input };
    const { data } = await blogClient.post<APIEnvelope<Tag>>("/admin/tag/", payload);
    return data.data;
  },

  async update(id: string, input: TagUpsertInput): Promise<Tag> {
    const payload = { a_aktif: true, ...input };
    const { data } = await blogClient.put<APIEnvelope<Tag>>(`/admin/tag/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await blogClient.delete(`/admin/tag/${id}`);
  },
};

// =================== Post Curation Admin ===================

export interface PostCurationInput {
  a_unggulan?: boolean;
  a_pinned?: boolean;
}

export const adminPostService = {
  async setCuration(id: string, input: PostCurationInput): Promise<Post> {
    const { data } = await blogClient.patch<APIEnvelope<Post>>(`/admin/posts/${id}/curation`, input);
    return data.data;
  },
};

// =================== Blog Management Admin ===================

export interface BlogFlagsInput {
  a_terverifikasi?: boolean;
  a_aktif?: boolean;
}

export const adminBlogService = {
  async setFlags(idBlog: string, input: BlogFlagsInput) {
    const { data } = await blogClient.patch<APIEnvelope<unknown>>(`/admin/blogs/${idBlog}/flags`, input);
    return data.data;
  },
};
