/**
 * Media Service — file uploads ke MinIO via blog-service.
 * Bucket: blog-media. Per-blog folder isolation.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export type JenisMedia = "image" | "video" | "audio" | "document" | "other";

// Variant URLs populated by backend on image upload.
// Keys: "thumb" (320w), "medium" (800w), "large" (1600w, only if source > 800w),
// "original" (the unmodified upload, same as url_publik).
// All variants except "original" are encoded as JPEG quality 82.
export type MediaVariants = Partial<Record<"thumb" | "medium" | "large" | "original", string>>;

export interface MediaItem {
  id_media: string;
  id_blog: string;
  id_pengguna_pdut: string;
  nama_file: string;
  path_storage: string;
  url_publik: string;
  mime_type: string;
  ukuran_bytes: number;
  lebar_px?: number | null;
  tinggi_px?: number | null;
  durasi_detik?: number | null;
  varian_json?: MediaVariants;
  alt_text?: string | null;
  caption?: string | null;
  jenis_media: JenisMedia;
  created_at: string;
  updated_at: string;
}

// Helper: pick the best variant URL for a target use case, fall back to original.
export function mediaURL(m: MediaItem, size: "thumb" | "medium" | "large" | "original" = "original"): string {
  return m.varian_json?.[size] || m.url_publik;
}

export interface MediaUsage {
  total_bytes: number;
  total_count: number;
}

export interface MediaListResult {
  items: MediaItem[];
  total: number;
  limit: number;
  offset: number;
  usage: MediaUsage;
  quota_bytes: number;
  max_file_bytes: number;
}

export interface UpdateMediaMetaInput {
  alt_text?: string;
  caption?: string;
}

export const meMediaService = {
  async list(jenis?: JenisMedia, limit = 30, offset = 0): Promise<MediaListResult> {
    const { data } = await blogClient.get<APIEnvelope<MediaListResult>>("/me/blog/media/", {
      params: { jenis, limit, offset },
    });
    return data.data;
  },

  async upload(file: File, altText?: string): Promise<MediaItem> {
    const fd = new FormData();
    fd.append("file", file);
    if (altText) fd.append("alt_text", altText);
    const { data } = await blogClient.post<APIEnvelope<MediaItem>>("/me/blog/media/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async delete(idMedia: string): Promise<void> {
    await blogClient.delete(`/me/blog/media/${idMedia}`);
  },

  async updateMeta(idMedia: string, input: UpdateMediaMetaInput): Promise<MediaItem> {
    const { data } = await blogClient.patch<APIEnvelope<MediaItem>>(
      `/me/blog/media/${idMedia}`,
      input,
    );
    return data.data;
  },
};
