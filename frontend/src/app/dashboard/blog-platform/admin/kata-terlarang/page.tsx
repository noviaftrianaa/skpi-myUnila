"use client";

// Admin: Kata Terlarang (Reserved Words) — manage ref.kata_terlarang.
// Dipakai oleh subdomain claim Layer 2 validation.
// Kategori: system / role / brand / offensive.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiEdit2, FiLoader, FiPlus, FiSearch, FiTrash2, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useCreateReservedWord, useDeleteReservedWord, useReservedWordsList, useUpdateReservedWord,
} from "@/lib/services/blog-platform";
import type { KataKategori, KataTerlarang } from "@/lib/services/blog-platform";

const PAGE_SIZE = 50;

const KATEGORI_LABEL: Record<KataKategori, string> = {
  system: "Sistem",
  role: "Role/Jabatan",
  brand: "Brand/Merk",
  offensive: "Tidak Pantas",
};

const KATEGORI_COLOR: Record<KataKategori, string> = {
  system: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  role: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  brand: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
  offensive: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

type FilterKategori = "" | KataKategori;

export default function AdminKataTerlarangPage() {
  const [filter, setFilter] = useState<FilterKategori>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useReservedWordsList({
    kategori: filter || undefined,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
  });
  const createMut = useCreateReservedWord();
  const updateMut = useUpdateReservedWord();
  const deleteMut = useDeleteReservedWord();

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KataTerlarang | null>(null);
  const [formKata, setFormKata] = useState("");
  const [formKategori, setFormKategori] = useState<KataKategori>("offensive");
  const [formKeterangan, setFormKeterangan] = useState("");

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.count_kategori ?? { system: 0, role: 0, brand: 0, offensive: 0 };
  const hasMore = offset + PAGE_SIZE < total;

  const openCreate = () => {
    setEditing(null);
    setFormKata("");
    setFormKategori("offensive");
    setFormKeterangan("");
    setFormOpen(true);
  };
  const openEdit = (k: KataTerlarang) => {
    setEditing(k);
    setFormKata(k.kata);
    setFormKategori(k.kategori);
    setFormKeterangan(k.keterangan || "");
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      kata: formKata.trim().toLowerCase(),
      kategori: formKategori,
      keterangan: formKeterangan.trim() || undefined,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id_kata_terlarang, input });
      } else {
        await createMut.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (k: KataTerlarang) => {
    if (!confirm(`Hapus kata "${k.kata}" dari daftar terlarang?\n\nSubdomain dengan kata ini akan kembali tersedia.`)) return;
    try {
      await deleteMut.mutateAsync(k.id_kata_terlarang);
    } catch (err) {
      alert(`Gagal hapus: ${(err as Error).message}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setOffset(0);
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Moderation</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiX className="w-6 h-6 text-rose-600" /> Kata Terlarang
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Subdomain yang mengandung kata ini akan ditolak (Layer 2 validation).
            {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700"
        >
          <FiPlus className="w-4 h-4" /> Tambah Kata
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Filter + Search */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari kata..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/40"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value as FilterKategori); setOffset(0); }}
          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">Semua Kategori</option>
          {(Object.keys(KATEGORI_LABEL) as KataKategori[]).map((k) => (
            <option key={k} value={k}>{KATEGORI_LABEL[k]} ({counts[k]})</option>
          ))}
        </select>
        <button type="submit" className="h-10 px-4 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700">
          Cari
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBox label="Total" value={total} />
        <StatBox label="Sistem" value={counts.system} />
        <StatBox label="Role" value={counts.role} accent="text-blue-600" />
        <StatBox label="Brand" value={counts.brand} accent="text-purple-600" />
        <StatBox label="Tidak Pantas" value={counts.offensive} accent="text-rose-600" />
      </div>

      {/* Table */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kata</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Dibuat</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      Tidak ada kata yang cocok dengan filter.
                    </td>
                  </tr>
                )}
                {items.map((k) => (
                  <tr key={k.id_kata_terlarang} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      {k.kata}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded font-semibold ${KATEGORI_COLOR[k.kategori]}`}>
                        {KATEGORI_LABEL[k.kategori]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">
                      {k.keterangan || <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(k.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEdit(k)}
                        className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                      >
                        <FiEdit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(k)}
                        disabled={deleteMut.isPending}
                        className="text-xs px-2 py-1 rounded border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

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

      {/* Form Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {editing ? "Edit Kata Terlarang" : "Tambah Kata Terlarang"}
              </h3>
              <button type="button" onClick={closeForm} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kata (lowercase, max 80 char)
                </label>
                <input
                  value={formKata}
                  onChange={(e) => setFormKata(e.target.value)}
                  maxLength={80}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/40"
                  placeholder="mis. spam, root, admin"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value as KataKategori)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                >
                  {(Object.keys(KATEGORI_LABEL) as KataKategori[]).map((k) => (
                    <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Keterangan (opsional)
                </label>
                <textarea
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/40"
                  placeholder="Konteks atau alasan kata ini dilarang"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || !formKata.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <FiLoader className="w-3.5 h-3.5 animate-spin" />}
                {editing ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
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

function StatBox({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card>
      <CardBody className="p-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-1 tabular-nums ${accent || "text-slate-900 dark:text-slate-100"}`}>
          {value.toLocaleString()}
        </p>
      </CardBody>
    </Card>
  );
}
