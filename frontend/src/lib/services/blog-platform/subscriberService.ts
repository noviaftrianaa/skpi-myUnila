/**
 * Subscriber Service — newsletter subscribers per blog (Phase BB).
 * Owner dashboard endpoint: list + counts. Public subscribe/confirm/unsubscribe
 * dilakukan langsung dari frontend-blog (tidak via dashboard).
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface SubscriberEntry {
  id_subscriber: string;
  id_blog: string;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  created_at: string;
  confirmed_at?: string | null;
  unsubscribed_at?: string | null;
  last_sent_at?: string | null;
}

export interface SubscriberListResult {
  items: SubscriberEntry[];
  total: number;
  confirmed_count: number;
  pending_count: number;
  unsubscribed_count: number;
}

export const meSubscriberService = {
  async list(limit = 50, offset = 0): Promise<SubscriberListResult> {
    const { data } = await blogClient.get<APIEnvelope<SubscriberListResult>>(
      "/me/blog/subscribers",
      { params: { limit, offset } },
    );
    return data.data;
  },
};
