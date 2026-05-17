/**
 * Follower Service — list followers untuk blog owner di dashboard.
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export interface FollowerEntry {
  id_follower: string;
  id_pengguna_pdut: string;
  tgl_follow: string;
}

export const meFollowerService = {
  async list(limit = 50, offset = 0): Promise<APIList<FollowerEntry>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<FollowerEntry>>>("/me/blog/followers", {
      params: { limit, offset },
    });
    return data.data;
  },
};
