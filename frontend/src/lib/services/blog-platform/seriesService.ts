/**
 * Series Service — group posts into ordered sequences.
 * One post belongs to at most one series.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface Series {
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

export interface SeriesPost {
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

export interface SeriesDetail {
  series: Series;
  posts: SeriesPost[];
}

export interface CreateSeriesInput {
  judul: string;
  slug?: string;
  deskripsi?: string | null;
  cover_url?: string | null;
}

export interface UpdateSeriesInput {
  judul?: string;
  slug?: string;
  deskripsi?: string | null;
  cover_url?: string | null;
  a_aktif?: boolean;
}

export const meSeriesService = {
  async list(activeOnly = false): Promise<Series[]> {
    const { data } = await blogClient.get<APIEnvelope<Series[]>>("/me/blog/series/", {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return data.data;
  },

  async get(idSeries: string): Promise<SeriesDetail> {
    const { data } = await blogClient.get<APIEnvelope<SeriesDetail>>(
      `/me/blog/series/${idSeries}`,
    );
    return data.data;
  },

  async create(input: CreateSeriesInput): Promise<Series> {
    const { data } = await blogClient.post<APIEnvelope<Series>>("/me/blog/series/", input);
    return data.data;
  },

  async update(idSeries: string, input: UpdateSeriesInput): Promise<Series> {
    const { data } = await blogClient.put<APIEnvelope<Series>>(
      `/me/blog/series/${idSeries}`,
      input,
    );
    return data.data;
  },

  async delete(idSeries: string): Promise<void> {
    await blogClient.delete(`/me/blog/series/${idSeries}`);
  },

  async attachPost(idSeries: string, idPost: string, urutan?: number): Promise<void> {
    await blogClient.post(`/me/blog/series/${idSeries}/posts/${idPost}`, { urutan });
  },

  async detachPost(idPost: string): Promise<void> {
    await blogClient.delete(`/me/blog/series-membership/${idPost}`);
  },

  async reorder(idSeries: string, orderedPostIDs: string[]): Promise<void> {
    await blogClient.patch(`/me/blog/series/${idSeries}/reorder`, {
      order: orderedPostIDs,
    });
  },
};
