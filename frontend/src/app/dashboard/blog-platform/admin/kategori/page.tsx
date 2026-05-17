"use client";

// Admin Kategori — CRUD master kategori artikel (global, dipakai semua blog).
// Sprint 3: editorial polish + inline edit + stat summary.
// Sprint 6: real API dari blog-service (port 8091) via TanStack Query.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiEdit3, FiHash, FiLoader, FiPlus, FiSearch, FiTag, FiTrash2, FiX,
} from "react-icons/fi";
import { useState, useMemo } from "react";
import {
  useKategoriList, useCreateKategori, useUpdateKategori, useDeleteKategori, useToggleKategoriAktif,
} from "@/lib/services/blog-platform";
import type { Kategori as APIKategori } from "@/lib/services/blog-platform";

// Bentuk lokal yang dipakai form/edit. Map dari APIKategori → local untuk display.
type Kategori = {
  id: string;
  slug: string;
  nm_kategori: string;
  warna: string;
  jumlah_post: number;
  a_aktif: boolean;
};

function fromAPI(k: APIKategori): Kategori {
  return {
    id: k.id_kategori_post,
    slug: k.slug,
    nm_kategori: k.nm_kategori,
    warna: k.warna || "#3B82F6",
    jumlah_post: k.jumlah_post,
    a_aktif: k.a_aktif,
  };
}

const COLOR_PRESETS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#0891B2", "#EC4899", "#84CC16", "#F97316"];

export default function AdminKategoriPage() {
  const { data: apiData, isLoading, error } = useKategoriList(false);
  const items = useMemo<Kategori[]>(() => (apiData ?? []).map(fromAPI), [apiData]);

  const createMut = useCreateKategori();
  const updateMut = useUpdateKategori();
  const deleteMut = useDeleteKategori();
  const toggleMut = useToggleKategoriAktif();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Kategori>>({});

  const filtered = useMemo(() => items.filter(k =>
    !search || k.nm_kategori.toLowerCase().includes(search.toLowerCase()) || k.slug.includes(search.toLowerCase())
  ), [items, search]);

  const totalPost = items.reduce((s, k) => s + k.jumlah_post, 0);
  const aktifCount = items.filter(k => k.a_aktif).length;

  const startNew = () => {
    setEditingId(null);
    setFormData({ slug: "", nm_kategori: "", warna: COLOR_PRESETS[0], jumlah_post: 0, a_aktif: true });
    setShowForm(true);
  };

  const startEdit = (k: Kategori) => {
    setEditingId(k.id);
    setFormData({ ...k });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setFormData({}); setEditingId(null); };

  const save = async () => {
    if (!formData.nm_kategori?.trim()) return;
    const input = {
      slug: formData.slug,
      nm_kategori: formData.nm_kategori,
      warna: formData.warna || COLOR_PRESETS[0],
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
      window.alert(`Gagal: ${msg}\n\nKalau 401: silakan login dulu di /login (dashboard butuh JWT auth).`);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Hapus kategori ini? Post yang terhubung akan kehilangan kategori (tetap published).")) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal hapus";
      window.alert(`Gagal: ${msg}`);
    }
  };

  const toggleAktif = async (id: string) => {
    try {
      await toggleMut.mutateAsync(id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal toggle";
      window.alert(`Gagal: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiTag className="w-6 h-6 text-myunila" /> Kategori Post
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Master kategori global yang dipakai semua blog.
            {isLoading && (
              <span className="ml-2 inline-flex items-center gap-1 text-myunila">
                <FiLoader className="w-3 h-3 animate-spin" /> Memuat dari API…
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
          <FiPlus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {/* API error banner */}
      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-900 dark:text-rose-300">Gagal memuat dari blog-service</p>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              Pastikan service jalan di port 8091. Error: {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {/* Stat overview */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total Kategori" value={items.length} color="myunila" />
        <StatBox label="Aktif" value={aktifCount} color="emerald" />
        <StatBox label="Total Post" value={totalPost} color="amber" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau slug…"
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30 focus:border-myunila/50"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FiTag className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-500">Tidak ada kategori cocok.</p>
            <button onClick={startNew} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white">
              <FiPlus className="w-4 h-4" /> Tambah Kategori Pertama
            </button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(k => (
            <Card key={k.id} className="shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-md hover:border-myunila/30 transition-all group">
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm"
                    style={{ backgroundColor: `${k.warna}20`, color: k.warna }}
                  >
                    {k.nm_kategori.charAt(0)}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(k)}
                      className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-myunila flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(k.id)}
                      className="w-7 h-7 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Hapus"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  {k.nm_kategori}
                </h3>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <FiHash className="w-3 h-3" />
                  <span className="font-mono">{k.slug}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Total artikel</p>
                    <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{k.jumlah_post.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => toggleAktif(k.id)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      k.a_aktif
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${k.a_aktif ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {k.a_aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeForm}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base inline-flex items-center gap-2">
                {editingId ? <><FiEdit3 className="w-4 h-4 text-myunila" /> Edit Kategori</> : <><FiPlus className="w-4 h-4 text-myunila" /> Kategori Baru</>}
              </h3>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nama Kategori *</label>
                <input
                  type="text"
                  value={formData.nm_kategori || ""}
                  onChange={(e) => setFormData({ ...formData, nm_kategori: e.target.value })}
                  placeholder="e.g. Teknologi"
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
                <p className="text-[10px] text-slate-400 mt-1 font-mono">/kategori/{formData.slug || "(auto)"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Warna</label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({ ...formData, warna: c })}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        formData.warna === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {formData.warna === c && <FiCheck className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
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
              <button
                onClick={closeForm}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={save}
                disabled={!formData.nm_kategori?.trim()}
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

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    myunila: { bg: "bg-myunila/10",     text: "text-myunila" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-950/30",     text: "text-amber-600 dark:text-amber-400" },
  };
  const c = colorMap[color] || colorMap.myunila;
  return (
    <Card className={`shadow-sm border border-slate-200/60 dark:border-slate-800 ${c.bg}`}>
      <CardBody className="p-4">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${c.text}`}>{value.toLocaleString()}</p>
      </CardBody>
    </Card>
  );
}
