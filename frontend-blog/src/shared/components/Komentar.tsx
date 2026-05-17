"use client";

// Komentar — public read + auth/anonymous create.
// Threaded: 1 level reply (depth 2). Status default 'pending' (moderasi).

import { useCallback, useEffect, useState } from "react";
import { CornerDownRight, Heart, MessageCircle, Send, User } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

interface APIKomentar {
  id_komentar: string;
  id_komentar_parent?: string | null;
  id_pengguna_pdut?: string | null;
  nm_komentator?: string | null;
  email_komentator?: string | null;
  isi: string;
  jumlah_like: number;
  a_pinned: boolean;
  created_at: string;
  replies?: APIKomentar[];
}

interface Props {
  idPost: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_access_token");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function Komentar({ idPost }: Props) {
  const [items, setItems] = useState<APIKomentar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isi, setIsi] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  // Reply state — track parent komentar yang sedang di-balas
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyIsi, setReplyIsi] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Like state — map id_komentar → liked (user's perspective) + counts
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const isLoggedIn = !!getToken();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/komentar`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const all: APIKomentar[] = json?.data ?? [];
      setItems(all);
      // Seed like counts dari response
      const counts: Record<string, number> = {};
      const walk = (xs: APIKomentar[]) => xs.forEach((k) => {
        counts[k.id_komentar] = k.jumlah_like || 0;
        if (k.replies?.length) walk(k.replies);
      });
      walk(all);
      setLikeCounts(counts);

      // Bulk hydrate liked map (auth only)
      const token = getToken();
      if (token) {
        try {
          const r = await fetch(`${API_BASE}/api/v1/posts/${idPost}/komentar-likes`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const j = await r.json();
            setLikedMap(j?.data ?? {});
          }
        } catch { /* ignore */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal load");
    } finally {
      setLoading(false);
    }
  }, [idPost]);

  useEffect(() => { load(); }, [load]);

  const toggleLike = useCallback(async (idKomentar: string) => {
    const token = getToken();
    if (!token) {
      window.alert("Login dulu di dashboard untuk like komentar 🙏");
      window.location.href = `${DASHBOARD}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    // Optimistic
    const wasLiked = !!likedMap[idKomentar];
    const prevCount = likeCounts[idKomentar] || 0;
    setLikedMap((m) => ({ ...m, [idKomentar]: !wasLiked }));
    setLikeCounts((c) => ({ ...c, [idKomentar]: wasLiked ? Math.max(prevCount - 1, 0) : prevCount + 1 }));

    try {
      const res = await fetch(`${API_BASE}/api/v1/komentar/${idKomentar}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (typeof json?.data?.liked === "boolean") {
        setLikedMap((m) => ({ ...m, [idKomentar]: json.data.liked }));
      }
      if (typeof json?.data?.total_likes === "number") {
        setLikeCounts((c) => ({ ...c, [idKomentar]: json.data.total_likes }));
      }
    } catch {
      // Revert
      setLikedMap((m) => ({ ...m, [idKomentar]: wasLiked }));
      setLikeCounts((c) => ({ ...c, [idKomentar]: prevCount }));
    }
  }, [likedMap, likeCounts]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) return;
    if (!isLoggedIn && (!name.trim() || !email.trim())) {
      window.alert("Untuk komentar anonim, isi nama & email dulu.");
      return;
    }
    setSubmitting(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const body: Record<string, string> = { isi: isi.trim() };
      if (!token) {
        body.nm_komentator = name.trim();
        body.email_komentator = email.trim();
      }
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/komentar`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || `Gagal kirim (${res.status})`);
      }
      setIsi("");
      setShowForm(false);
      setThanks(true);
      setTimeout(() => setThanks(false), 5000);
    } catch (e) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply ke parent komentar
  const submitReply = async (parentId: string) => {
    if (!replyIsi.trim()) return;
    if (!isLoggedIn && (!replyName.trim() || !replyEmail.trim())) {
      window.alert("Untuk balas anonim, isi nama & email dulu.");
      return;
    }
    setReplySubmitting(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const body: Record<string, string> = {
        isi: replyIsi.trim(),
        id_komentar_parent: parentId,
      };
      if (!token) {
        body.nm_komentator = replyName.trim();
        body.email_komentator = replyEmail.trim();
      }
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/komentar`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || `Gagal balas (${res.status})`);
      }
      setReplyIsi("");
      setReplyTo(null);
      setThanks(true);
      setTimeout(() => setThanks(false), 5000);
    } catch (e) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <section className="mt-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold inline-flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-myunila" />
          Komentar <span className="text-sm font-normal text-slate-500">({items.length})</span>
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-myunila text-white hover:bg-myunila-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Tulis Komentar
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={submit} className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-3">
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama *"
                required
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email *"
                required
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
            </div>
          )}
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder={isLoggedIn ? "Tulis komentar Anda…" : "Tulis komentar Anda (anonim — butuh nama + email)…"}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-myunila/30"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-slate-500">
            <span>
              {isLoggedIn ? "Sebagai user terdaftar" : "Komentar anonim — akan dimoderasi sebelum tampil"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setIsi(""); }}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !isi.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50"
              >
                <Send className="w-3 h-3" /> {submitting ? "Mengirim…" : "Kirim Komentar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {thanks && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-sm text-emerald-800 dark:text-emerald-300">
          ✓ Terima kasih! Komentar tersimpan & menunggu moderasi sebelum tampil.
        </div>
      )}

      {/* List */}
      {loading && <p className="text-sm text-slate-500">Memuat komentar…</p>}
      {error && <p className="text-sm text-rose-500">Gagal load: {error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">
          Belum ada komentar approved. Jadilah yang pertama!
        </p>
      )}

      <ul className="space-y-4">
        {items.map((k) => (
          <li key={k.id_komentar} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
            <KomentarItem
              k={k}
              liked={!!likedMap[k.id_komentar]}
              likeCount={likeCounts[k.id_komentar] ?? k.jumlah_like}
              onToggleLike={toggleLike}
            />
            <div className="mt-2 ml-9">
              <button
                onClick={() => { setReplyTo(replyTo === k.id_komentar ? null : k.id_komentar); setReplyIsi(""); }}
                className="text-xs text-myunila hover:underline inline-flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" /> {replyTo === k.id_komentar ? "Batal balas" : "Balas"}
              </button>
            </div>

            {/* Reply form */}
            {replyTo === k.id_komentar && (
              <form
                onSubmit={(e) => { e.preventDefault(); submitReply(k.id_komentar); }}
                className="mt-3 ml-9 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                {!isLoggedIn && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      placeholder="Nama *"
                      required
                      className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-myunila/30"
                    />
                    <input
                      type="email"
                      value={replyEmail}
                      onChange={(e) => setReplyEmail(e.target.value)}
                      placeholder="Email *"
                      required
                      className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-myunila/30"
                    />
                  </div>
                )}
                <textarea
                  value={replyIsi}
                  onChange={(e) => setReplyIsi(e.target.value)}
                  rows={2}
                  maxLength={5000}
                  placeholder={`Balas ${k.nm_komentator || "anonim"}…`}
                  required
                  className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-myunila/30"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setReplyTo(null); setReplyIsi(""); }}
                    className="px-2.5 py-1 rounded-md text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={replySubmitting || !replyIsi.trim()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50"
                  >
                    <Send className="w-2.5 h-2.5" /> {replySubmitting ? "..." : "Kirim Balasan"}
                  </button>
                </div>
              </form>
            )}

            {k.replies && k.replies.length > 0 && (
              <ul className="mt-3 ml-6 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
                {k.replies.map((r) => (
                  <li key={r.id_komentar}>
                    <KomentarItem
                      k={r}
                      liked={!!likedMap[r.id_komentar]}
                      likeCount={likeCounts[r.id_komentar] ?? r.jumlah_like}
                      onToggleLike={toggleLike}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

interface KomentarItemProps {
  k: APIKomentar;
  liked: boolean;
  likeCount: number;
  onToggleLike: (id: string) => void;
}

// Render @subdomain mentions as clickable links to that blog's apex.
// Regex matches the same pattern as backend extractMentions.
function renderWithMentions(text: string): React.ReactNode[] {
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  const re = /@([a-z0-9][a-z0-9-]{1,58}[a-z0-9])/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const sub = m[1];
    if (sub.includes("--")) {
      out.push(m[0]);
    } else {
      out.push(
        <a key={`${m.index}-${sub}`} href={`https://${sub}.${apex}`}
          target="_blank" rel="noopener noreferrer"
          className="text-myunila hover:underline font-medium">
          @{sub}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function KomentarItem({ k, liked, likeCount, onToggleLike }: KomentarItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm mb-1.5">
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <User className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{k.nm_komentator || "Anonim"}</span>
        {k.a_pinned && <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">Pinned</span>}
        <span className="text-xs text-slate-400 ml-auto">{formatDate(k.created_at)}</span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{renderWithMentions(k.isi)}</p>
      <button
        type="button"
        onClick={() => onToggleLike(k.id_komentar)}
        className={`mt-2 ml-9 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
          liked
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        }`}
        aria-label={liked ? "Unlike komentar" : "Like komentar"}
      >
        <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
        <span className="tabular-nums">{likeCount}</span>
      </button>
    </div>
  );
}
