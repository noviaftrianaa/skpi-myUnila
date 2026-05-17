import { blogClient, type APIEnvelope, type APIList } from "./blogClient";
import type { Post, PostStatus, PostStatusCount, PostSummary } from "./types";

export interface ListPostsParams {
  status?: PostStatus | "";
  subdomain?: string;
  id_blog?: string;
  kategori?: string;          // slug
  search?: string;
  order?: "latest" | "popular" | "oldest" | "trending";
  unggulan?: boolean;
  pinned?: boolean;
  limit?: number;
  offset?: number;
}

export const postService = {
  async list(params: ListPostsParams = {}): Promise<APIList<PostSummary>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<PostSummary>>>("/posts", {
      params: {
        status: params.status ?? "published",
        subdomain: params.subdomain,
        id_blog: params.id_blog,
        kategori: params.kategori,
        search: params.search,
        order: params.order ?? "latest",
        unggulan: params.unggulan ? "1" : undefined,
        pinned: params.pinned ? "1" : undefined,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
    return data.data;
  },

  async getByID(id: string): Promise<Post> {
    const { data } = await blogClient.get<APIEnvelope<Post>>(`/posts/${id}`);
    return data.data;
  },

  async getBySlug(subdomain: string, slug: string): Promise<Post> {
    const { data } = await blogClient.get<APIEnvelope<Post>>(`/posts/by-slug/${subdomain}/${slug}`);
    return data.data;
  },

  async statusCount(idBlog: string): Promise<PostStatusCount[]> {
    const { data } = await blogClient.get<APIEnvelope<PostStatusCount[]>>("/posts/status-count", {
      params: { id_blog: idBlog },
    });
    return data.data;
  },
};
