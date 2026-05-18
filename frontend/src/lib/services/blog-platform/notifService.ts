/**
 * Notif Service — feed engagement (like/komentar/reply/follower).
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export type NotifType =
  | "like_post"
  | "komentar_post"
  | "reply_komentar"
  | "follow_blog"
  | "new_post_from_following"
  | "mention_komentar"
  | "mention_post"
  | "coauthor_invite"
  | "coauthor_responded"
  // Phase BE — bukan notif row di feed, tapi opt-out toggle untuk email digest mingguan
  | "weekly_digest";

export interface NotifEntry {
  id_notifikasi: string;
  id_aktor_pdut?: string;
  aktor_nama?: string;
  tipe: NotifType;
  id_ref_post?: string;
  id_ref_komentar?: string;
  id_ref_blog?: string;
  judul_ref?: string;
  url_target?: string;
  sudah_dibaca: boolean;
  tgl_dibaca?: string;
  created_at: string;
}

export interface NotifPreference {
  id_pengguna_pdut: string;
  muted_tipes: NotifType[];
  updated_at: string;
}

export const ALL_NOTIF_TIPES: { value: NotifType; label: string; desc: string }[] = [
  { value: "like_post", label: "Like di post", desc: "Saat ada user nge-like post kamu" },
  { value: "komentar_post", label: "Komentar di post", desc: "Saat ada komentar baru di post kamu" },
  { value: "reply_komentar", label: "Reply komentar", desc: "Saat ada reply ke komentar kamu" },
  { value: "follow_blog", label: "Follower baru", desc: "Saat ada user follow blog kamu" },
  { value: "new_post_from_following", label: "Post baru dari following", desc: "Saat blog yang kamu follow publish post baru" },
  { value: "mention_komentar",  label: "Mention di komentar",   desc: "Saat ada user mention @kamu di komentar" },
  { value: "mention_post",      label: "Mention di post",       desc: "Saat ada user mention @kamu di isi post" },
  { value: "coauthor_invite",   label: "Undangan co-author",    desc: "Saat ada penulis lain mengundang kamu sebagai co-author" },
  { value: "coauthor_responded", label: "Respon co-author",     desc: "Saat invitee menerima atau menolak undangan co-author kamu" },
  { value: "weekly_digest",     label: "Digest email mingguan", desc: "Email rangkuman top post dari blog yang kamu ikuti, dikirim seminggu sekali" },
];

export const meNotifService = {
  async list(onlyUnread = false, limit = 20, offset = 0): Promise<APIList<NotifEntry>> {
    const { data } = await blogClient.get<APIEnvelope<APIList<NotifEntry>>>("/me/notifications", {
      params: { unread: onlyUnread ? "true" : undefined, limit, offset },
    });
    return data.data;
  },
  async unreadCount(): Promise<number> {
    const { data } = await blogClient.get<APIEnvelope<{ unread_count: number }>>("/me/notifications/unread-count");
    return data.data.unread_count;
  },
  async markRead(idNotif: string): Promise<void> {
    await blogClient.post(`/me/notifications/${idNotif}/read`);
  },
  async markAllRead(): Promise<number> {
    const { data } = await blogClient.post<APIEnvelope<{ marked: number }>>("/me/notifications/read-all");
    return data.data.marked;
  },
  async getPreferences(): Promise<NotifPreference> {
    const { data } = await blogClient.get<APIEnvelope<NotifPreference>>("/me/notifications/preferences");
    return data.data;
  },
  async setPreferences(mutedTipes: NotifType[]): Promise<NotifPreference> {
    const { data } = await blogClient.put<APIEnvelope<NotifPreference>>("/me/notifications/preferences", {
      muted_tipes: mutedTipes,
    });
    return data.data;
  },
};
