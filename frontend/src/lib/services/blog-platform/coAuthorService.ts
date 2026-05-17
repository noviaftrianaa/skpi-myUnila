/**
 * Co-author Service — multi-author per post.
 * Primary author owns the post; this service manages additional contributors.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export type CoAuthorPeran = "co_author" | "editor" | "reviewer" | "kontributor";
export type CoAuthorStatus = "pending" | "accepted" | "declined";

export const CO_AUTHOR_PERAN_LABEL: Record<CoAuthorPeran, string> = {
  co_author: "Co-author",
  editor: "Editor",
  reviewer: "Reviewer",
  kontributor: "Kontributor",
};

export const CO_AUTHOR_STATUS_LABEL: Record<CoAuthorStatus, string> = {
  pending: "Menunggu jawaban",
  accepted: "Diterima",
  declined: "Ditolak",
};

export interface CoAuthor {
  id_blog_co: string;
  subdomain: string;
  nm_tampilan: string;
  nm_blog: string;
  avatar_url?: string | null;
  peran: CoAuthorPeran;
  urutan: number;
  catatan?: string | null;
  status: CoAuthorStatus;
  responded_at?: string | null;
  alasan_response?: string | null;
  created_at: string;
}

export interface CoAuthorInvite {
  id_post: string;
  judul: string;
  slug: string;
  post_status: string;
  tgl_terbit?: string | null;
  subdomain: string;
  nm_blog: string;
  owner_nm_tampilan?: string | null;
  owner_avatar?: string | null;
  peran: CoAuthorPeran;
  status: CoAuthorStatus;
  catatan?: string | null;
  responded_at?: string | null;
  added_at: string;
}

export interface RespondInviteInput {
  action: "accept" | "decline";
  alasan?: string;
}

export interface AddCoAuthorInput {
  id_blog_co: string;
  peran?: CoAuthorPeran;
  urutan?: number;
  catatan?: string | null;
}

export interface UpdateCoAuthorInput {
  peran?: CoAuthorPeran;
  urutan?: number;
  catatan?: string | null;
}

export const meCoAuthorService = {
  async list(idPost: string): Promise<CoAuthor[]> {
    const { data } = await blogClient.get<APIEnvelope<CoAuthor[]>>(
      `/me/blog/posts/${idPost}/co-authors/`,
    );
    return data.data;
  },

  async add(idPost: string, input: AddCoAuthorInput): Promise<unknown> {
    const { data } = await blogClient.post<APIEnvelope<unknown>>(
      `/me/blog/posts/${idPost}/co-authors/`,
      input,
    );
    return data.data;
  },

  async update(idPost: string, idBlogCo: string, input: UpdateCoAuthorInput): Promise<unknown> {
    const { data } = await blogClient.patch<APIEnvelope<unknown>>(
      `/me/blog/posts/${idPost}/co-authors/${idBlogCo}`,
      input,
    );
    return data.data;
  },

  async remove(idPost: string, idBlogCo: string): Promise<void> {
    await blogClient.delete(`/me/blog/posts/${idPost}/co-authors/${idBlogCo}`);
  },

  async listMyInvites(status?: CoAuthorStatus, limit = 20): Promise<CoAuthorInvite[]> {
    const { data } = await blogClient.get<APIEnvelope<CoAuthorInvite[]>>(
      "/me/blog/co-author-invites",
      { params: { status, limit } },
    );
    return data.data;
  },

  async respondInvite(idPost: string, input: RespondInviteInput): Promise<{ id_post: string; accepted: boolean; peran: string }> {
    const { data } = await blogClient.patch<APIEnvelope<{ id_post: string; accepted: boolean; peran: string }>>(
      `/me/blog/co-author-invites/${idPost}`,
      input,
    );
    return data.data;
  },
};

// Public — for post detail page byline.
export const publicCoAuthorService = {
  async listForPost(idPost: string): Promise<CoAuthor[]> {
    const { data } = await blogClient.get<APIEnvelope<CoAuthor[]>>(
      `/posts/${idPost}/co-authors`,
    );
    return data.data;
  },
};
