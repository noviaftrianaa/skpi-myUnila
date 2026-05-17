"use client";

// My Bookmarks — reading list user. Berbeda dari menu lain (blog owner-specific),
// halaman ini bisa dipakai oleh siapa saja yang punya akun, tidak butuh blog sendiri.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiBookmark, FiClock, FiEdit2, FiEye, FiHeart, FiLoader, FiTag, FiTrash2,
} from "react-icons/fi";
import { useState } from "react";
import {
  useBookmarkList, useBookmarkLabels, useRemoveBookmark, useUpdateBookmarkLabel,
} from "@/lib/services/blog-platform";
import type { BookmarkEntry } from "@/lib/services/blog-platform";

const PAGE_SIZE = 20;

export default function BookmarksPage() {
  const [offset, setOffset] = useState(0);
  const [labelFilter, setLabelFilter] = useState<string>("");
  const { data, isLoading, error, refetch } = useBookmarkList(labelFilter || undefined, PAGE_SIZE, offset);
  const { data: labels = [] } = useBookmarkLabels();
  const updateLabelMut = useUpdateBookmarkLabel();

  const handleEditLabel = async (b: BookmarkEntry) => {
    const newLabel = prompt(`Label untuk "${b.judul.slice(0, 60)}"\n\nKosongkan untuk hapus label.`, b.label || "");
    if (newLabel === null) return;
    try {
      await updateLabelMut.mutateAsync({
        id: b.id_bookmark_post,
        label: newLabel.trim() || null,
      });
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    }
  };
  const removeMutation = useRemoveBookmark();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  const handleRemove = async (idBookmark: string) => {
    if (!confirm("Hapus dari reading list?")) return;
    try {
      await removeMutation.mutateAsync(idBookmark);
      refetch();
    } catch {
      alert("Gagal hapus bookmark.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiBookmark className="w-6 h-6 text-myunila" /> Reading List
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Post yang kamu simpan untuk dibaca nanti.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          {!isLoading && !error && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live data
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-myunila/5 to-transparent">
        <CardBody className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-myunila/10 text-myunila flex items-center justify-center">
              <FiBookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{total.toLocaleString()}</p>
              <p className="text-xs text-slate-500">post tersimpan</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {labels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wider mr-1">Filter label:</span>
          <button
            onClick={() => { setLabelFilter(""); setOffset(0); }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              labelFilter === "" ? "border-myunila bg-myunila/10 text-myunila" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Semua
          </button>
          {labels.map((l) => (
            <button
              key={l.label}
              onClick={() => { setLabelFilter(l.label); setOffset(0); }}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors inline-flex items-center gap-1 ${
                labelFilter === l.label ? "border-myunila bg-myunila/10 text-myunila" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <FiTag className="w-3 h-3" /> {l.label} <span className="text-slate-400 tabular-nums">·{l.count}</span>
            </button>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiBookmark className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Belum ada post di reading list kamu.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Klik ikon <FiBookmark className="inline w-3 h-3" /> di post mana saja untuk menambahkan.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((b) => {
            const postUrl = `https://${b.subdomain}.blog.unila.ac.id/posts/${b.slug}`;
            return (
              <Card key={b.id_bookmark_post} className="shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col">
                {b.cover_url && (
                  <div className="aspect-[16/9] relative bg-slate-100 dark:bg-slate-800">
                    {/* Use plain img — pasti load dari host external */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.cover_url} alt={b.judul} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardBody className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                    <span className="font-mono">{b.subdomain}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3" /> {b.waktu_baca_menit} mnt</span>
                  </div>
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-myunila transition-colors"
                  >
                    {b.judul}
                  </a>
                  {b.ringkasan && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{b.ringkasan}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {b.label ? (
                      <button
                        onClick={() => handleEditLabel(b)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-myunila/10 text-myunila hover:bg-myunila/20"
                        title="Klik untuk edit label"
                      >
                        <FiTag className="w-3 h-3" /> {b.label}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditLabel(b)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-slate-400 hover:text-myunila hover:bg-slate-50 dark:hover:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700"
                      >
                        <FiTag className="w-3 h-3" /> Tambah label
                      </button>
                    )}
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><FiEye className="w-3 h-3" /> {b.jumlah_view.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><FiHeart className="w-3 h-3" /> {b.jumlah_like.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditLabel(b)}
                        disabled={updateLabelMut.isPending}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        title="Edit label"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(b.id_bookmark_post)}
                        disabled={removeMutation.isPending}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50"
                        title="Hapus dari reading list"
                      >
                        <FiTrash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
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

      <div className="rounded-lg border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-300">
        <strong>Tips:</strong> Bookmark berbeda dari Like. Bookmark adalah reading list pribadi — orang lain tidak melihatnya.
        Gunakan untuk simpan post panjang yang ingin kamu baca nanti, atau referensi yang sering kamu rujuk.
      </div>

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
