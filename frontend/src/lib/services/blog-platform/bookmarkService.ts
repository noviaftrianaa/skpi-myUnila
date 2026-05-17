/**
 * Bookmark Service — reading list user di dashboard.
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export interface BookmarkEntry {
  id_bookmark_post: string;
  id_post: string;
  catatan?: string;
  label?: string;
  bookmarked_at: string;
  subdomain: string;
  nm_blog: string;
  blog_avatar_url?: string;
  judul: string;
  slug: string;
  ringkasan?: string;
  cover_url?: string;
  kategori_slug?: string;
  kategori_nama?: string;
  kategori_warna?: string;
  tgl_terbit?: string;
  jumlah_view: number;
  jumlah_like: number;
  waktu_baca_menit: number;
  status: string;
}

export interface BookmarkLabelStat {
  label: string;
  count: number;
}

export const meBookmarkService = {
  async list(label?: string, limit = 20, offset = 0): Promise<APIList<BookmarkEntry>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<BookmarkEntry>>>("/me/bookmarks", {
      params: { limit, offset, label: label || undefined },
    });
    return data.data;
  },
  async listLabels(): Promise<BookmarkLabelStat[]> {
    const { data } = await blogClient.get<APIEnvelope<BookmarkLabelStat[]>>("/me/bookmarks/labels");
    return data.data;
  },
  async updateLabel(idBookmark: string, label: string | null): Promise<void> {
    await blogClient.patch(`/me/bookmarks/${idBookmark}/label`, { label });
  },
  async remove(idBookmark: string): Promise<void> {
    await blogClient.delete(`/me/bookmarks/${idBookmark}`);
  },
};
