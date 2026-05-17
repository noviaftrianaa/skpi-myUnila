"use client";

// Posts list — editorial-style list dengan thumbnail, status pill, engagement metrics inline.
// Konsisten dengan dashboard tune-up (Medium/Substack feel).

import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@heroui/react";
import {
  FiBookmark, FiCalendar, FiCheck, FiEdit3, FiExternalLink, FiEye,
  FiFileText, FiHeart, FiLock, FiMessageCircle, FiPlus, FiRotateCcw, FiSearch,
  FiStar, FiTrash2,
} from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  usePostList, useMyBlog, usePostStatusCount,
  useTrashList, useRestorePost, usePermanentDeletePost, useToggleAuthorPin,
} from "@/lib/services/blog-platform";
import type { PostSummary, PostStatus } from "@/lib/services/blog-platform";

const STATUS_TABS = [
  { value: "all",       label: "Semua",      color: "slate"   },
  { value: "published", label: "Published",  color: "emerald" },
  { value: "draft",     label: "Draft",      color: "slate"   },
  { value: "scheduled", label: "Scheduled",  color: "blue"    },
  { value: "trash",     label: "Trash",      color: "rose"    },
] as const;

const STATUS_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  draft:     { bg: "bg-slate-100 dark:bg-slate-800",        text: "text-slate-700 dark:text-slate-300",    dot: "bg-slate-400"   },
  review:    { bg: "bg-amber-100 dark:bg-amber-950/40",     text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500"   },
  published: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400",dot: "bg-emerald-500" },
  scheduled: { bg: "bg-blue-100 dark:bg-blue-950/40",       text: "text-blue-700 dark:text-blue-400",      dot: "bg-blue-500"    },
  archived:  { bg: "bg-slate-100 dark:bg-slate-800",        text: "text-slate-600 dark:text-slate-400",    dot: "bg-slate-400"   },
  trash:     { bg: "bg-rose-100 dark:bg-rose-950/40",       text: "text-rose-700 dark:text-rose-400",      dot: "bg-rose-500"    },
};

const TAB_BADGE: Record<string, string> = {
  slate:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  emerald: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  blue:    "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  rose:    "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

export default function PostsListPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <PostsListInner />
    </Suspense>
  );
}

function PostsListInner() {
  const sp = useSearchParams();
  const statusFilter = sp.get("status") || "all";
  const [search, setSearch] = useState("");

  const isTrash = statusFilter === "trash";

  // Live data — resolve blog dulu, lalu list posts dengan filter status & search
  const { data: blog } = useMyBlog();
  const { data: countsData } = usePostStatusCount(blog?.id_blog || "");
  // Regular list (active posts only) — disabled when di trash tab
  const { data: list, isLoading: loadingActive, error: errorActive } = usePostList({
    id_blog: blog?.id_blog,
    status: statusFilter === "all" ? "" : (statusFilter as PostStatus),
    search,
    order: "latest",
    limit: 50,
  });
  // Trash list (soft-deleted) — only loaded when tab=trash
  const { data: trashList, isLoading: loadingTrash, error: errorTrash } = useTrashList(50, 0, isTrash);

  const items: PostSummary[] = isTrash ? (trashList?.items ?? []) : (list?.items ?? []);
  const isLoading = isTrash ? loadingTrash : loadingActive;
  const error = isTrash ? errorTrash : errorActive;

  // Build counts map dari API response
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: 0, published: 0, draft: 0, scheduled: 0, trash: 0, review: 0, archived: 0 };
    (countsData ?? []).forEach(c => { out[c.status] = c.total; out.all += c.total; });
    return out;
  }, [countsData]);

  const activeTab = STATUS_TABS.find(s => s.value === statusFilter) || STATUS_TABS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiFileText className="w-6 h-6 text-myunila" /> Posts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola semua artikel kamu — {counts.published} published, {counts.draft} draft, {counts.scheduled} scheduled.
            {isLoading && <span className="ml-2 text-myunila text-xs">· memuat…</span>}
            {error && <span className="ml-2 text-rose-500 text-xs">· {(error as Error).message}</span>}
          </p>
        </div>
        <Link
          href="/dashboard/blog-platform/posts/baru"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
        >
          <FiPlus className="w-4 h-4" /> Tulis Post Baru
        </Link>
      </div>

      {/* Status tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {STATUS_TABS.map(s => {
            const isActive = statusFilter === s.value;
            const count = counts[s.value] ?? 0;
            return (
              <Link
                key={s.value}
                href={s.value === "all" ? "/dashboard/blog-platform/posts" : `/dashboard/blog-platform/posts?status=${s.value}`}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-myunila text-myunila"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {s.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${TAB_BADGE[s.color]}`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="relative w-full sm:w-72 mb-2 sm:mb-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul / ringkasan…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 -mt-3">
        Menampilkan <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{items.length}</strong> {activeTab.label.toLowerCase()}
        {search && <> · pencarian: &ldquo;<strong>{search}</strong>&rdquo;</>}
      </p>

      {/* Posts list */}
      {items.length === 0 ? (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FiFileText className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-500">Tidak ada post di status ini.</p>
            <Link
              href="/dashboard/blog-platform/posts/baru"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:shadow-md transition-shadow"
            >
              <FiPlus className="w-4 h-4" /> Mulai Tulis Baru
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(p => <PostRow key={p.id_post} post={p} isTrash={isTrash} />)}
        </div>
      )}
    </div>
  );
}

function PostRow({ post: p, isTrash }: { post: PostSummary; isTrash: boolean }) {
  const status = STATUS_PILL[p.status];
  const restoreMut = useRestorePost();
  const permanentMut = usePermanentDeletePost();
  const pinMut = useToggleAuthorPin();

  const handleTogglePin = async () => {
    try {
      await pinMut.mutateAsync(p.id_post);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "Gagal toggle pin");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreMut.mutateAsync(p.id_post);
    } catch (e: unknown) {
      window.alert(`Gagal restore: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };
  const handlePermanent = async () => {
    if (!confirm(`Hapus permanen post "${p.judul}"?\n\nIni tidak bisa di-undo — semua komentar/likes/views ikut dihapus via cascade.`)) return;
    try {
      await permanentMut.mutateAsync(p.id_post);
    } catch (e: unknown) {
      window.alert(`Gagal hapus: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };
  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-md hover:border-myunila/30 transition-all group">
      <CardBody className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail 16:9 */}
          <div className="flex-shrink-0 relative w-28 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            {p.cover_url ? (
              <Image
                src={p.cover_url}
                alt={p.judul}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <FiFileText className="w-6 h-6" />
              </div>
            )}
            {p.a_pinned && (
              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-white shadow flex items-center justify-center" title="Pinned oleh admin">
                <FiBookmark className="w-2.5 h-2.5" />
              </span>
            )}
            {p.a_unggulan_blog && (
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-myunila text-white shadow flex items-center justify-center" title="Di-pin oleh kamu di tenant home">
                <FiBookmark className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <Link
                href={`/dashboard/blog-platform/posts/${p.id_post}/edit`}
                className="flex-1 min-w-0 group/title"
              >
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-snug tracking-tight group-hover/title:text-myunila transition-colors line-clamp-2">
                  {p.judul}
                  {p.a_unggulan && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" title="Featured">
                      <FiStar className="w-3 h-3" />
                    </span>
                  )}
                </h3>
              </Link>
              {/* Status pill */}
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {p.status}
              </span>
            </div>

            {p.ringkasan && (
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-snug line-clamp-1">
                {p.ringkasan}
              </p>
            )}

            {/* Footer: kategori + meta + actions */}
            <div className="mt-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                {p.kategori_nama && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${p.kategori_warna || "#64748B"}15`, color: p.kategori_warna || "#64748B" }}
                  >
                    {p.kategori_nama}
                  </span>
                )}
                {p.visibilitas !== "public" && (
                  <span className="inline-flex items-center gap-0.5 text-slate-400">
                    <FiLock className="w-3 h-3" /> {p.visibilitas}
                  </span>
                )}
                {p.tgl_terbit && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(p.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
                {p.tgl_jadwal && !p.tgl_terbit && (
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 tabular-nums">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(p.tgl_jadwal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} (terjadwal)
                  </span>
                )}
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">/{p.slug}</span>
              </div>

              {/* Engagement stats (compact) */}
              <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                <span className="inline-flex items-center gap-1" title="Views">
                  <FiEye className="w-3.5 h-3.5" /> {p.jumlah_view.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1" title="Likes">
                  <FiHeart className="w-3.5 h-3.5" /> {p.jumlah_like}
                </span>
                <span className="inline-flex items-center gap-1" title="Komentar">
                  <FiMessageCircle className="w-3.5 h-3.5" /> {p.jumlah_komentar}
                </span>
              </div>
            </div>
          </div>

          {/* Action icons (icon-only, tooltips) */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {isTrash ? (
              <>
                <button
                  onClick={handleRestore}
                  disabled={restoreMut.isPending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
                  title="Restore — kembalikan ke draft"
                >
                  <FiRotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePermanent}
                  disabled={permanentMut.isPending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                  title="Hapus permanen — tidak bisa di-undo"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/dashboard/blog-platform/posts/${p.id_post}/edit`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-myunila/10 hover:text-myunila transition-colors"
                  title="Edit"
                >
                  <FiEdit3 className="w-4 h-4" />
                </Link>
                {p.status === "published" && (
                  <button
                    onClick={handleTogglePin}
                    disabled={pinMut.isPending}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${
                      p.a_unggulan_blog
                        ? "text-myunila bg-myunila/10 hover:bg-myunila/20"
                        : "text-slate-400 hover:bg-myunila/10 hover:text-myunila"
                    }`}
                    title={p.a_unggulan_blog ? "Unpin dari tenant home" : "Pin ke tenant home (max 3)"}
                  >
                    <FiBookmark className="w-4 h-4" />
                  </button>
                )}
                {p.status === "published" && (
                  <a
                    href={`https://${p.subdomain}.blog.unila.ac.id/posts/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-myunila/10 hover:text-myunila transition-colors"
                    title="Lihat di blog"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
