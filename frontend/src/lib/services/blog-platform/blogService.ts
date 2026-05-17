import { blogClient, type APIEnvelope, type APIList } from "./blogClient";
import type { Blog, BlogSummary } from "./types";

export interface ListBlogsParams {
  search?: string;
  role?: "MHS" | "STAF" | "DOSEN" | "ALUMNI" | "";
  aktifOnly?: boolean;
  order?: "popular" | "latest" | "alphabetical";
  limit?: number;
  offset?: number;
}

export const blogService = {
  async list(params: ListBlogsParams = {}): Promise<APIList<BlogSummary>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<BlogSummary>>>("/blogs", {
      params: {
        search: params.search,
        role: params.role || undefined,
        aktif: params.aktifOnly === false ? "0" : "1",
        order: params.order ?? "popular",
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
    return data.data;
  },

  async getBySubdomain(subdomain: string): Promise<Blog> {
    const { data } = await blogClient.get<APIEnvelope<Blog>>(`/blogs/by-subdomain/${subdomain}`);
    return data.data;
  },

  async getByID(id: string): Promise<Blog> {
    const { data } = await blogClient.get<APIEnvelope<Blog>>(`/blogs/${id}`);
    return data.data;
  },
};
