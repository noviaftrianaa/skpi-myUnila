"use client";

// Series Library — group posts ke ordered sequences.
// List + create + inline edit + delete + manage post list per series.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiArrowDown, FiArrowUp, FiBookOpen, FiCheck, FiEdit2,
  FiFileText, FiLoader, FiMinus, FiPlus, FiTrash2, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useSeriesList, useSeriesDetail, useCreateSeries, useUpdateSeries,
  useDeleteSeries, useDetachPostFromSeries, useReorderSeries,
  useAttachPostToSeries, useMyBlog, usePostList,
} from "@/lib/services/blog-platform";
import type { Series, SeriesPost } from "@/lib/services/blog-platform";

export default function SeriesPage() {
  const { data: seriesList = [], isLoading, error } = useSeriesList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected = selectedId ? seriesList.find((s) => s.id_series === selectedId) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Konten</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiBookOpen className="w-6 h-6 text-myunila" /> Series
          {isLoading && <FiLoader className="w-4 h-4 animate-spin text-myunila" />}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Group post ke sequence — cocok untuk tutorial multi-part, lecture series, atau riset berseri.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 tabular-nums">{seriesList.length} series</span>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
        >
          <FiPlus className="w-4 h-4" /> Series Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="lg:col-span-1 space-y-3">
          {seriesList.length === 0 && !isLoading ? (
            <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="py-12 text-center">
                <FiBookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Belum ada series. Klik &ldquo;Series Baru&rdquo; untuk mulai.</p>
              </CardBody>
            </Card>
          ) : (
            seriesList.map((s) => (
              <button
                key={s.id_series}
                onClick={() => setSelectedId(s.id_series)}
                className={`w-full text-left rounded-lg border transition-all p-4 ${
                  selectedId === s.id_series
                    ? "border-myunila ring-2 ring-myunila/20 bg-myunila/5"
                    : "border-slate-200 dark:border-slate-800 hover:border-myunila/40 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                    {s.judul}
                  </h3>
                  {!s.a_aktif && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 uppercase">
                      Draft
                    </span>
                  )}
                </div>
                {s.deskripsi && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{s.deskripsi}</p>
                )}
                <p className="mt-2 text-[11px] text-slate-400 tabular-nums">
                  {s.jumlah_post} post · /{s.slug}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Right: detail / picker */}
        <div className="lg:col-span-2">
          {selected ? (
            <SeriesDetail series={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
              <CardBody className="py-16 text-center">
                <FiFileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Pilih series di kiri untuk lihat detail + atur post-nya.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {showCreate && <CreateSeriesModal onClose={() => setShowCreate(false)} onCreated={(id) => { setSelectedId(id); setShowCreate(false); }} />}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

// ============================== Components ==============================

function SeriesDetail({ series, onClose }: { series: Series; onClose: () => void }) {
  const { data: detail, isLoading } = useSeriesDetail(series.id_series);
  const updateMut = useUpdateSeries();
  const deleteMut = useDeleteSeries();
  const detachMut = useDetachPostFromSeries();
  const reorderMut = useReorderSeries();

  const [editMode, setEditMode] = useState(false);
  const [showAddPosts, setShowAddPosts] = useState(false);
  const [editJudul, setEditJudul] = useState(series.judul);
  const [editSlug, setEditSlug] = useState(series.slug);
  const [editDesc, setEditDesc] = useState(series.deskripsi || "");
  const [editAktif, setEditAktif] = useState(series.a_aktif);

  const posts = detail?.posts ?? [];

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({
        id: series.id_series,
        input: {
          judul: editJudul,
          slug: editSlug,
          deskripsi: editDesc || null,
          a_aktif: editAktif,
        },
      });
      setEditMode(false);
    } catch (e) {
      alert(`Gagal simpan: ${(e as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus series "${series.judul}"?\n\nPost di dalamnya tidak akan terhapus, hanya keluar dari series.`)) return;
    try {
      await deleteMut.mutateAsync(series.id_series);
      onClose();
    } catch (e) {
      alert(`Gagal hapus: ${(e as Error).message}`);
    }
  };

  const handleDetach = async (idPost: string, judul: string) => {
    if (!confirm(`Keluarkan "${judul}" dari series ini?`)) return;
    try {
      await detachMut.mutateAsync(idPost);
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    }
  };

  const movePost = async (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= posts.length) return;
    const ordered = [...posts];
    [ordered[idx], ordered[target]] = [ordered[target], ordered[idx]];
    try {
      await reorderMut.mutateAsync({
        idSeries: series.id_series,
        orderedPostIDs: ordered.map((p) => p.id_post),
      });
    } catch (e) {
      alert(`Gagal reorder: ${(e as Error).message}`);
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          {editMode ? (
            <div className="flex-1 space-y-2">
              <input
                value={editJudul}
                onChange={(e) => setEditJudul(e.target.value)}
                placeholder="Judul series"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
              <input
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                placeholder="slug-url"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Deskripsi (opsional)"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editAktif} onChange={(e) => setEditAktif(e.target.checked)} />
                Aktif (tampil di public)
              </label>
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={updateMut.isPending} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50">
                  {updateMut.isPending ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                  Simpan
                </button>
                <button onClick={() => setEditMode(false)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FiX className="w-3.5 h-3.5" /> Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{series.judul}</h2>
              <p className="mt-0.5 text-xs text-slate-500 font-mono">/{series.slug}</p>
              {series.deskripsi && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{series.deskripsi}</p>}
              <p className="mt-2 text-[11px] text-slate-400">
                {series.jumlah_post} post · {series.a_aktif ? "Aktif" : "Draft"}
              </p>
            </div>
          )}
          {!editMode && (
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditJudul(series.judul); setEditSlug(series.slug); setEditDesc(series.deskripsi || ""); setEditAktif(series.a_aktif); setEditMode(true); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit">
                <FiEdit2 className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={handleDelete} disabled={deleteMut.isPending} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500" title="Hapus">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Posts list */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Post dalam Series</h3>
            <button
              onClick={() => setShowAddPosts(true)}
              className="text-[11px] text-myunila hover:underline inline-flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" /> Tambah Post
            </button>
          </div>
          {isLoading && (
            <div className="py-6 text-center text-xs text-slate-400 inline-flex items-center gap-2 mx-auto">
              <FiLoader className="w-3.5 h-3.5 animate-spin" /> Memuat post…
            </div>
          )}
          {!isLoading && posts.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">
              Belum ada post di series ini. Buka editor post → pilih series ini dari sidebar.
            </p>
          )}
          {posts.length > 0 && (
            <ol className="space-y-2">
              {posts.map((p, idx) => <SeriesPostRow key={p.id_post} p={p} idx={idx} total={posts.length} onMove={movePost} onDetach={handleDetach} isReordering={reorderMut.isPending} />)}
            </ol>
          )}
        </div>
      </CardBody>
      {showAddPosts && (
        <AddPostsModal
          idSeries={series.id_series}
          existingPostIDs={posts.map((p) => p.id_post)}
          existingCount={posts.length}
          onClose={() => setShowAddPosts(false)}
        />
      )}
    </Card>
  );
}

function AddPostsModal({ idSeries, existingPostIDs, existingCount, onClose }: {
  idSeries: string;
  existingPostIDs: string[];
  existingCount: number;
  onClose: () => void;
}) {
  const { data: blog } = useMyBlog();
  const { data: list, isLoading } = usePostList({
    id_blog: blog?.id_blog,
    order: "latest",
    limit: 100,
  });
  const attachMut = useAttachPostToSeries();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const inSeriesSet = new Set(existingPostIDs);
  // Filter to posts not already in this series. We can't (cheaply) tell if a
  // post is in OTHER series from the public list endpoint; reassigning here
  // is harmless (backend just updates id_series).
  const candidates = (list?.items ?? []).filter((p) => !inSeriesSet.has(p.id_post));

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    let n = existingCount;
    for (const idPost of selected) {
      try {
        n += 1;
        await attachMut.mutateAsync({ idSeries, idPost, urutan: n });
      } catch (e) {
        console.error(e);
      }
    }
    setAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base">Tambah Post ke Series</h3>
            <p className="text-xs text-slate-500 mt-0.5">Post yang sudah ada di series ini disembunyikan.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="py-10 text-center text-sm text-slate-400 inline-flex items-center gap-2 mx-auto">
              <FiLoader className="w-4 h-4 animate-spin" /> Memuat post…
            </div>
          )}
          {!isLoading && candidates.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              Tidak ada post lain yang bisa ditambahkan. Buat post baru dulu via /posts.
            </p>
          )}
          <ul className="space-y-1">
            {candidates.map((p) => {
              const checked = selected.has(p.id_post);
              return (
                <li key={p.id_post}>
                  <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    checked ? "bg-myunila/5 border border-myunila/30" : "border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id_post)}
                      className="w-4 h-4 accent-myunila"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{p.judul}</p>
                      <p className="text-[10px] text-slate-500 tabular-nums">
                        {p.status} · {p.jumlah_view.toLocaleString()} views · {new Date(p.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 tabular-nums">{selected.size} dipilih</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Batal
            </button>
            <button onClick={submit} disabled={selected.size === 0 || adding} className="px-3 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50 inline-flex items-center gap-1.5">
              {adding ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlus className="w-4 h-4" />}
              Tambah ({selected.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeriesPostRow({ p, idx, total, onMove, onDetach, isReordering }: {
  p: SeriesPost;
  idx: number;
  total: number;
  onMove: (idx: number, dir: -1 | 1) => void;
  onDetach: (idPost: string, judul: string) => void;
  isReordering: boolean;
}) {
  return (
    <li className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <span className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center tabular-nums">
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{p.judul}</p>
        <p className="text-[10px] text-slate-500 tabular-nums">
          {p.status} · {p.jumlah_view.toLocaleString()} views · {p.waktu_baca_menit} mnt baca
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onMove(idx, -1)} disabled={idx === 0 || isReordering} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Naik">
          <FiArrowUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1 || isReordering} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Turun">
          <FiArrowDown className="w-3.5 h-3.5" />
        </button>
        <Link href={`/dashboard/blog-platform/posts/${p.id_post}/edit`} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit post">
          <FiEdit2 className="w-3.5 h-3.5 text-slate-500" />
        </Link>
        <button onClick={() => onDetach(p.id_post, p.judul)} className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500" title="Keluarkan">
          <FiMinus className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}

function CreateSeriesModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const createMut = useCreateSeries();

  const submit = async () => {
    if (!judul.trim()) return;
    try {
      const created = await createMut.mutateAsync({
        judul: judul.trim(),
        slug: slug.trim() || undefined,
        deskripsi: deskripsi.trim() || null,
      });
      onCreated(created.id_series);
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base">Series Baru</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Judul *</label>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              autoFocus
              placeholder="Belajar React untuk Pemula"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Slug (opsional)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generate dari judul"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder="Tutorial 6 part untuk pemula yang belum pernah pakai React."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            Batal
          </button>
          <button onClick={submit} disabled={!judul.trim() || createMut.isPending} className="px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md disabled:opacity-50 inline-flex items-center gap-1.5">
            {createMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
            Buat Series
          </button>
        </div>
      </div>
    </div>
  );
}
