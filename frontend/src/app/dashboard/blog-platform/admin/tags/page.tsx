"use client";

// Admin Tag Manager — CRUD master tag global (auto-created saat author tulis).
// Beda dengan kategori: tag bebas/free-form, kategori curated/admin-managed.
// Sprint 6: real API dari blog-service via TanStack Query.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiEdit3, FiHash, FiLoader, FiPlus, FiSearch, FiTrash2, FiTrendingUp, FiX,
} from "react-icons/fi";
import { useState, useMemo } from "react";
import { useTagList, useCreateTag, useUpdateTag, useDeleteTag } from "@/lib/services/blog-platform";
import type { Tag as APITag } from "@/lib/services/blog-platform";

// Lokal type untuk display + form (kompatibel dengan API + sedikit field tambahan).
type MockTag = {
  id: string;
  slug: string;
  nm_tag: string;
  deskripsi?: string;
  jumlah_post: number;
  a_aktif: boolean;
  tgl_create: string;
};

function fromAPI(t: APITag): MockTag {
  return {
    id: t.id_tag,
    slug: t.slug,
    nm_tag: t.nm_tag,
    deskripsi: t.deskripsi || undefined,
    jumlah_post: t.frekuensi,
    a_aktif: t.a_aktif,
    tgl_create: t.created_at,
  };
}

export default function AdminTagsPage() {
  const { data: apiTags, isLoading, error } = useTagList({ aktifOnly: false, limit: 500 });
  const items = useMemo<MockTag[]>(() => (apiTags ?? []).map(fromAPI), [apiTags]);

  const createMut = useCreateTag();
  const updateMut = useUpdateTag();
  const deleteMut = useDeleteTag();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "name" | "recent">("popular");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MockTag>>({});

  const filtered = useMemo(() => {
    let list = items.filter(t =>
      !search || t.nm_tag.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())
    );
    if (sortBy === "popular") list = [...list].sort((a, b) => b.jumlah_post - a.jumlah_post);
    else if (sortBy === "name") list = [...list].sort((a, b) => a.nm_tag.localeCompare(b.nm_tag));
    else list = [...list].sort((a, b) => b.tgl_create.localeCompare(a.tgl_create));
    return list;
  }, [items, search, sortBy]);

  const totalPostsWithTags = items.reduce((s, t) => s + t.jumlah_post, 0);
  const aktifCount = items.filter(t => t.a_aktif).length;
  const orphanCount = items.filter(t => t.jumlah_post === 0).length;

  const startNew = () => {
    setEditingId(null);
    setFormData({ slug: "", nm_tag: "", deskripsi: "", jumlah_post: 0, a_aktif: true });
    setShowForm(true);
  };

  const startEdit = (t: MockTag) => {
    setEditingId(t.id);
    setFormData({ ...t });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setFormData({}); setEditingId(null); };

  const save = async () => {
    if (!formData.nm_tag?.trim()) return;
    const input = {
      slug: formData.slug,
      nm_tag: formData.nm_tag,
      deskripsi: formData.deskripsi || undefined,
      a_aktif: formData.a_aktif !== false,
    };
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, input });
      } else {
        await createMut.mutateAsync(input);
      }
      closeForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan";
      window.alert(`Gagal: ${msg}\n\nKalau 401: silakan login dulu di /login (butuh JWT auth).`);
    }
  };

  const remove = async (t: MockTag) => {
    const msg = t.jumlah_post > 0
      ? `Tag "${t.nm_tag}" sedang dipakai di ${t.jumlah_post} post. Yakin hapus? Post tidak akan terhapus.`
      : `Hapus tag "${t.nm_tag}"?`;
    if (!window.confirm(msg)) return;
    try {
      await deleteMut.mutateAsync(t.id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Gagal hapus";
      window.alert(`Gagal: ${m}`);
    }
  };

  const cleanupOrphans = async () => {
    if (orphanCount === 0) return;
    if (!window.confirm(`Hapus ${orphanCount} tag tanpa post?`)) return;
    const orphans = items.filter(t => t.jumlah_post === 0);
    try {
      await Promise.all(orphans.map(t => deleteMut.mutateAsync(t.id)));
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Gagal cleanup";
      window.alert(`Gagal: ${m}`);
    }
  };

  // Tag cloud size based on usage
  const maxUsage = Math.max(...items.map(t => t.jumlah_post), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiHash className="w-6 h-6 text-myunila" /> Tag Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Master tag global · auto-created saat author tulis, di-curate di sini.
            {isLoading && (
              <span className="ml-2 inline-flex items-center gap-1 text-myunila">
                <FiLoader className="w-3 h-3 animate-spin" /> Memuat…
              </span>
            )}
            {!isLoading && !error && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live data
              </span>
            )}
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
        >
          <FiPlus className="w-4 h-4" /> Tambah Tag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Total Tag" value={items.length} color="myunila" />
        <StatBox label="Aktif" value={aktifCount} color="emerald" />
        <StatBox label="Total Post Tagged" value={totalPostsWithTags} color="blue" />
        <StatBox label="Orphan (0 post)" value={orphanCount} color="amber" action={orphanCount > 0 ? { label: "Cleanup", onClick: cleanupOrphans } : undefined} />
      </div>

      {/* Tag cloud preview */}
      {items.length > 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
                <FiTrendingUp className="w-3.5 h-3.5" /> Tag Cloud Preview
              </h3>
              <p className="text-[10px] text-slate-400">Visual representation di public site</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.filter(t => t.a_aktif && t.jumlah_post > 0).map(t => {
                const ratio = t.jumlah_post / maxUsage;
                const size = Math.max(0.75, Math.min(1.6, 0.75 + ratio * 0.85));
                const opacity = Math.max(0.5, ratio);
                return (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-myunila/10 text-myunila font-medium hover:bg-myunila/20 cursor-pointer transition-colors"
                    style={{ fontSize: `${size}em`, opacity }}
                    title={`${t.jumlah_post} post`}
                  >
                    #{t.nm_tag}
                  </span>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau slug…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
          />
        </div>
        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          {[
            { v: "popular", l: "Popular" },
            { v: "recent",  l: "Terbaru" },
            { v: "name",    l: "A-Z" },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => setSortBy(opt.v as typeof sortBy)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sortBy === opt.v
                  ? "bg-white dark:bg-slate-900 text-myunila shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {search ? "Tidak ada tag cocok pencarian." : "Belum ada tag."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Tag</th>
                    <th className="px-4 py-3 hidden md:table-cell">Slug</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Deskripsi</th>
                    <th className="px-4 py-3 text-right">Posts</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 group">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-myunila/10 text-myunila">
                          <FiHash className="w-3 h-3" />
                          {t.nm_tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-mono text-slate-500">{t.slug}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          {t.deskripsi || <em className="text-slate-400">—</em>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${t.jumlah_post === 0 ? "text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                          {t.jumlah_post.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.a_aktif
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.a_aktif ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {t.a_aktif ? "Aktif" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(t)}
                            className="w-7 h-7 rounded-md hover:bg-myunila/10 text-slate-400 hover:text-myunila flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <FiEdit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => remove(t)}
                            className="w-7 h-7 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeForm}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base inline-flex items-center gap-2">
                {editingId ? <><FiEdit3 className="w-4 h-4 text-myunila" /> Edit Tag</> : <><FiPlus className="w-4 h-4 text-myunila" /> Tag Baru</>}
              </h3>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nama Tag *</label>
                <input
                  type="text"
                  value={formData.nm_tag || ""}
                  onChange={(e) => setFormData({ ...formData, nm_tag: e.target.value })}
                  placeholder="e.g. Machine Learning"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-dari-nama"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">/tag/{formData.slug || "(auto)"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Deskripsi (opsional)</label>
                <textarea
                  rows={2}
                  value={formData.deskripsi || ""}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Penjelasan singkat tentang tag ini…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktif</label>
                <button
                  onClick={() => setFormData({ ...formData, a_aktif: !formData.a_aktif })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    formData.a_aktif !== false ? "bg-myunila" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span className={`absolute top-0.5 ${formData.a_aktif !== false ? "left-5" : "left-0.5"} w-5 h-5 rounded-full bg-white shadow transition-all`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={closeForm} className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                Batal
              </button>
              <button
                onClick={save}
                disabled={!formData.nm_tag?.trim()}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-shadow"
              >
                <FiCheck className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color, action }: {
  label: string; value: number; color: string;
  action?: { label: string; onClick: () => void };
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    myunila: { bg: "bg-myunila/10",     text: "text-myunila" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
    blue:    { bg: "bg-blue-50 dark:bg-blue-950/30",       text: "text-blue-600 dark:text-blue-400" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-950/30",     text: "text-amber-600 dark:text-amber-400" },
  };
  const c = colorMap[color] || colorMap.myunila;
  return (
    <Card className={`shadow-sm border border-slate-200/60 dark:border-slate-800 ${c.bg}`}>
      <CardBody className="p-4">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">{label}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className={`text-2xl font-bold tabular-nums ${c.text}`}>{value.toLocaleString()}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`text-[10px] font-bold uppercase tracking-wider underline hover:no-underline ${c.text}`}
            >
              {action.label}
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
