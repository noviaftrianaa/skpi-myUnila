"use client";

// Admin: Featured + Pinned Posts Curation.
// Toggle a_unggulan / a_pinned untuk post mana pun (cross-blog).
// Search published posts → klik toggle. Featured tampil di apex /, Pinned tampil di per-blog.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiAward, FiClock, FiExternalLink, FiEye, FiHeart,
  FiLoader, FiSearch, FiStar, FiX,
} from "react-icons/fi";
import { useState } from "react";
import { useCuratePost, usePostList } from "@/lib/services/blog-platform";
import type { PostSummary } from "@/lib/services/blog-platform";

const PAGE_SIZE = 20;
const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

type Tab = "featured" | "pinned" | "browse";

export default function AdminFeaturedPage() {
  const [tab, setTab] = useState<Tab>("featured");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [offset, setOffset] = useState(0);
  const curate = useCuratePost();
  const [actingId, setActingId] = useState<string | null>(null);

  const filterParams = {
    status: "published" as const,
    limit: PAGE_SIZE,
    offset,
    unggulan: tab === "featured" ? true : undefined,
    pinned: tab === "pinned" ? true : undefined,
    search: tab === "browse" ? search : undefined,
    order: "latest" as const,
  };

  const { data, isLoading, error } = usePostList(filterParams);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setOffset(0);
  };

  const toggleFeatured = async (p: PostSummary) => {
    setActingId(p.id_post);
    try {
      await curate.mutateAsync({ id: p.id_post, input: { a_unggulan: !p.a_unggulan } });
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const togglePinned = async (p: PostSummary) => {
    setActingId(p.id_post);
    try {
      await curate.mutateAsync({ id: p.id_post, input: { a_pinned: !p.a_pinned } });
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Curation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiAward className="w-6 h-6 text-amber-500" /> Featured & Pinned Posts
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><FiStar className="w-3 h-3 text-amber-500" /> Featured</span> tampil di apex blog homepage.{" "}
          <span className="inline-flex items-center gap-1"><FiAward className="w-3 h-3 text-blue-500" /> Pinned</span> dipin di atas list per-blog.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {(
          [
            { key: "featured", label: "Featured Saat Ini", icon: FiStar },
            { key: "pinned", label: "Pinned Saat Ini", icon: FiAward },
            { key: "browse", label: "Cari & Curate", icon: FiSearch },
          ] as { key: Tab; label: string; icon: typeof FiStar }[]
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setOffset(0); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                tab === t.key
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "browse" && (
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul / ringkasan post..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/40"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700"
          >
            Cari
          </button>
        </form>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              {tab === "featured" ? <FiStar className="w-7 h-7" /> : tab === "pinned" ? <FiAward className="w-7 h-7" /> : <FiSearch className="w-7 h-7" />}
            </div>
            <p className="text-sm text-slate-500">
              {tab === "featured"
                ? "Belum ada post yang ditandai featured. Buka tab 'Cari & Curate' untuk pilih."
                : tab === "pinned"
                ? "Belum ada post yang dipin. Pin biasanya untuk pengumuman atau konten penting."
                : search
                ? `Tidak ada post yang cocok dengan "${search}".`
                : "Ketik kata kunci untuk cari post yang ingin dikurasi."}
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((p, idx) => {
            const postUrl = `https://${p.subdomain}.${APEX_HOST}/posts/${p.slug}`;
            const acting = actingId === p.id_post;
            const isFeatured = p.a_unggulan;
            const isPinned = p.a_pinned;
            return (
              <Card key={p.id_post} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {tab === "featured" && (
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-2xl font-display font-bold text-amber-500">
                        {String(offset + idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}

                  {p.cover_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.cover_url}
                      alt={p.judul}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <a
                      href={postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-myunila inline-flex items-center gap-1.5"
                    >
                      {p.judul} <FiExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{p.subdomain}</span> · {p.nm_blog}
                      {p.kategori_nama && (
                        <>
                          {" · "}
                          <span style={{ color: p.kategori_warna || "#3B82F6" }}>{p.kategori_nama}</span>
                        </>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1"><FiEye className="w-3 h-3" /> {p.jumlah_view.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><FiHeart className="w-3 h-3" /> {p.jumlah_like.toLocaleString()}</span>
                      {p.tgl_terbit && (
                        <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3" /> {new Date(p.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleFeatured(p)}
                      disabled={acting}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        isFeatured
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                      }`}
                      title={isFeatured ? "Klik untuk un-feature" : "Klik untuk feature"}
                    >
                      <FiStar className={`w-3.5 h-3.5 ${isFeatured ? "fill-current" : ""}`} />
                      {isFeatured ? "Featured" : "Feature"}
                    </button>
                    <button
                      onClick={() => togglePinned(p)}
                      disabled={acting}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        isPinned
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100"
                      }`}
                      title={isPinned ? "Klik untuk un-pin" : "Klik untuk pin"}
                    >
                      <FiAward className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
                      {isPinned ? "Pinned" : "Pin"}
                    </button>
                    {acting && <FiLoader className="w-4 h-4 text-myunila animate-spin" />}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {(offset > 0 || hasMore) && items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="tabular-nums">
            {offset + 1}–{Math.min(offset + items.length, total)} dari {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={!hasMore}
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/dashboard/blog-platform"
          className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
