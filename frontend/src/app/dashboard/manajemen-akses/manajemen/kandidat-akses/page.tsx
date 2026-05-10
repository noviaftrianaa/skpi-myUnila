"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  rolePenggunaService,
  type KandidatItem,
  type KandidatKategori,
  type KandidatResult,
} from "@/lib/services/manakses/rolePenggunaService";

type KategoriMeta = {
  key: KandidatKategori;
  label: string;
  desc: string;
  icon: string;
  bg: string;
  bgSelected: string;
  text: string;
  ring: string;
  pill: string;
  primaryAction: "perpanjang" | "revoke" | "set_kadaluarsa";
};

const KATEGORI: KategoriMeta[] = [
  {
    key: "alumni",
    label: "Alumni Lulus",
    desc: "Mahasiswa yang sudah lulus (id_jns_keluar=1 + sk_yudisium)",
    icon: "heroicons:academic-cap",
    bg: "bg-blue-50/60 dark:bg-blue-900/15",
    bgSelected: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-400",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    primaryAction: "revoke",
  },
  {
    key: "mutasi",
    label: "Keluar/Mutasi",
    desc: "Mahasiswa keluar selain lulus (drop out, pindah, dll)",
    icon: "heroicons:arrow-right-on-rectangle",
    bg: "bg-amber-50/60 dark:bg-amber-900/15",
    bgSelected: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-400",
    pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    primaryAction: "revoke",
  },
  {
    key: "expired",
    label: "Sudah Expired",
    desc: "Role dengan tgl_kadaluarsa < hari ini",
    icon: "heroicons:exclamation-triangle",
    bg: "bg-red-50/60 dark:bg-red-900/15",
    bgSelected: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-red-400",
    pill: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    primaryAction: "perpanjang",
  },
  {
    key: "akan_expire",
    label: "Akan Expire",
    desc: "Role yang masa berlakunya tinggal ≤30 hari",
    icon: "heroicons:clock",
    bg: "bg-orange-50/60 dark:bg-orange-900/15",
    bgSelected: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    ring: "ring-orange-400",
    pill: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    primaryAction: "perpanjang",
  },
  {
    key: "tanpa_kadaluarsa",
    label: "Tanpa Tgl Kadaluarsa",
    desc: "Role fungsional yang belum punya masa berlaku — perlu di-set",
    icon: "heroicons:question-mark-circle",
    bg: "bg-gray-50/60 dark:bg-slate-800/40",
    bgSelected: "bg-gray-200 dark:bg-slate-700/60",
    text: "text-gray-700 dark:text-slate-300",
    ring: "ring-gray-400",
    pill: "bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200",
    primaryAction: "set_kadaluarsa",
  },
];

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function defaultExpiryDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function KandidatAksesPage() {
  const [kategori, setKategori] = useState<KandidatKategori>("alumni");
  const [data, setData] = useState<KandidatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [showPerpanjang, setShowPerpanjang] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [perpanjangForm, setPerpanjangForm] = useState({
    tgl_kadaluarsa: defaultExpiryDate(),
    sk_penugasan: "",
    tgl_sk_penugasan: new Date().toISOString().slice(0, 10),
    alasan: "",
  });
  const [revokeAlasan, setRevokeAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const meta = useMemo(() => KATEGORI.find((k) => k.key === kategori)!, [kategori]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rolePenggunaService.getKandidat({
        kategori,
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setSelected(new Set());
  }, [kategori, page, limit, debouncedSearch]);

  // Reset page when filter changes
  useEffect(() => setPage(1), [kategori, debouncedSearch, limit]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    setSelected((prev) => {
      if (prev.size === data.data.length) return new Set();
      return new Set(data.data.map((r) => r.id_role_pengguna));
    });
  };

  const handlePerpanjangSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selected);
      const payload = {
        tgl_kadaluarsa: perpanjangForm.tgl_kadaluarsa,
        sk_penugasan: perpanjangForm.sk_penugasan || undefined,
        tgl_sk_penugasan: perpanjangForm.tgl_sk_penugasan || undefined,
        alasan: perpanjangForm.alasan || undefined,
      };
      const res =
        ids.length === 1
          ? await rolePenggunaService.perpanjang(ids[0], payload).then(() => ({ updated: 1, requested: 1 }))
          : await rolePenggunaService.perpanjangBatch(ids, payload);
      toast.success(`${res.updated}/${res.requested} role berhasil diperpanjang`);
      setShowPerpanjang(false);
      setSelected(new Set());
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal perpanjang role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeSubmit = async () => {
    if (selected.size === 0 || !revokeAlasan.trim()) return;
    setSubmitting(true);
    try {
      const ids = Array.from(selected);
      const res = await rolePenggunaService.revokeBatch(ids, revokeAlasan);
      toast.success(`${res.deleted}/${res.requested} role berhasil dicabut`);
      setShowRevoke(false);
      setRevokeAlasan("");
      setSelected(new Set());
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal revoke role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Link href="/dashboard/manajemen-akses" className="hover:text-blue-600 dark:hover:text-blue-400">
            Manajemen Akses
          </Link>
          <Icon icon="heroicons:chevron-right" className="h-3 w-3" />
          <span className="text-gray-700 dark:text-slate-300">Kandidat Akses</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kandidat Review Akses</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              Review pengguna yang perlu di-perpanjang, di-cabut, atau di-set masa berlakunya — by kategori.
            </p>
          </div>
        </div>
      </div>

      {/* Kategori tabs */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {KATEGORI.map((k) => {
          const active = k.key === kategori;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => setKategori(k.key)}
              className={`group relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition ${
                active
                  ? `border-transparent ${k.bgSelected} ring-2 ${k.ring} shadow-sm`
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon={k.icon} className={`h-5 w-5 ${active ? k.text : "text-gray-400 dark:text-slate-500"}`} />
                <span className={`text-sm font-semibold ${active ? k.text : "text-gray-900 dark:text-white"}`}>
                  {k.label}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-gray-500 dark:text-slate-400">{k.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon
              icon="heroicons:magnifying-glass"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, username, atau email..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / hal
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 ? (
            <>
              <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${meta.pill}`}>
                {selected.size} dipilih
              </span>
              {(meta.primaryAction === "perpanjang" || meta.primaryAction === "set_kadaluarsa") && (
                <button
                  type="button"
                  onClick={() => setShowPerpanjang(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md"
                >
                  <Icon icon="heroicons:arrow-path" className="h-4 w-4" />
                  {meta.primaryAction === "set_kadaluarsa" ? "Set Tgl Kadaluarsa" : "Perpanjang"}
                </button>
              )}
              {(meta.primaryAction === "revoke" || meta.key === "expired") && (
                <button
                  type="button"
                  onClick={() => setShowRevoke(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md"
                >
                  <Icon icon="heroicons:no-symbol" className="h-4 w-4" />
                  Cabut Role
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Pilih baris untuk aksi batch
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {error ? (
          <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : loading && !data ? (
          <div className="flex justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-12 text-center">
            <Icon
              icon="heroicons:check-circle"
              className="mx-auto h-12 w-12 text-emerald-300 dark:text-emerald-700"
            />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-slate-300">
              Tidak ada kandidat di kategori "{meta.label}"
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Semua role di kategori ini sudah dalam keadaan baik.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/40">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === data.data.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3">Pengguna</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Unit</th>
                  <RowExtraHeader kategori={kategori} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {data.data.map((u) => {
                  const isSelected = selected.has(u.id_role_pengguna);
                  const initials = u.nm_pengguna
                    ? u.nm_pengguna
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((s) => s[0]?.toUpperCase())
                        .join("")
                    : "?";
                  return (
                    <tr
                      key={u.id_role_pengguna}
                      className={`transition ${
                        isSelected ? "bg-blue-50/60 dark:bg-blue-900/10" : "hover:bg-gray-50/60 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id_role_pengguna)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {u.nm_pengguna || "—"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {u.username}
                              {u.email && <span className="ml-2 text-gray-400">· {u.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-200">
                        <div className="font-medium">{u.nm_peran}</div>
                        <div className="text-[10px] text-gray-400">ID #{u.id_peran}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {u.nm_organisasi || <span className="text-gray-400">—</span>}
                      </td>
                      <RowExtraCell kategori={kategori} u={u} pillClass={meta.pill} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row dark:border-slate-700">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Menampilkan {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} dari{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">{data.total}</span> kandidat
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Sebelumnya
              </button>
              <span className="px-3 text-sm text-gray-600 dark:text-slate-400">
                Hal. <span className="font-semibold text-gray-900 dark:text-white">{data.page}</span>
                {" / "}
                <span className="font-semibold text-gray-900 dark:text-white">{data.total_pages}</span>
              </span>
              <button
                type="button"
                disabled={page >= data.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL Perpanjang */}
      {showPerpanjang && (
        <Modal onClose={() => setShowPerpanjang(false)}>
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon icon="heroicons:arrow-path" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {meta.primaryAction === "set_kadaluarsa" ? "Set Tanggal Kadaluarsa" : "Perpanjang Role"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {selected.size} role akan diperpanjang. Default: 1 tahun dari hari ini.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                  Tanggal Kadaluarsa Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={perpanjangForm.tgl_kadaluarsa}
                  onChange={(e) =>
                    setPerpanjangForm((p) => ({ ...p, tgl_kadaluarsa: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Nomor SK
                  </label>
                  <input
                    type="text"
                    value={perpanjangForm.sk_penugasan}
                    onChange={(e) => setPerpanjangForm((p) => ({ ...p, sk_penugasan: e.target.value }))}
                    placeholder="Opsional"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Tgl SK
                  </label>
                  <input
                    type="date"
                    value={perpanjangForm.tgl_sk_penugasan}
                    onChange={(e) =>
                      setPerpanjangForm((p) => ({ ...p, tgl_sk_penugasan: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                  Alasan / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={perpanjangForm.alasan}
                  onChange={(e) => setPerpanjangForm((p) => ({ ...p, alasan: e.target.value }))}
                  placeholder="Opsional, untuk audit log"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowPerpanjang(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePerpanjangSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="h-4 w-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL Revoke */}
      {showRevoke && (
        <Modal onClose={() => setShowRevoke(false)}>
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <Icon icon="heroicons:no-symbol" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Cabut Role Pengguna
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {selected.size} role akan di-soft-delete (bisa di-restore manual jika perlu).
                </p>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                Alasan Pencabutan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revokeAlasan}
                onChange={(e) => setRevokeAlasan(e.target.value)}
                placeholder="Misal: 'Sudah lulus pada periode wisuda 2026/I'"
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowRevoke(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRevokeSubmit}
                disabled={submitting || !revokeAlasan.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                    Mencabut...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:trash" className="h-4 w-4" />
                    Cabut
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RowExtraHeader({ kategori }: { kategori: KandidatKategori }) {
  switch (kategori) {
    case "alumni":
      return (
        <>
          <th className="px-4 py-3">Tgl Lulus</th>
          <th className="px-4 py-3">SK Yudisium</th>
        </>
      );
    case "mutasi":
      return (
        <>
          <th className="px-4 py-3">Tgl Keluar</th>
          <th className="px-4 py-3">Jenis Keluar</th>
        </>
      );
    case "expired":
      return (
        <>
          <th className="px-4 py-3">Tgl Kadaluarsa</th>
          <th className="px-4 py-3">Overdue</th>
        </>
      );
    case "akan_expire":
      return (
        <>
          <th className="px-4 py-3">Tgl Kadaluarsa</th>
          <th className="px-4 py-3">Sisa</th>
        </>
      );
    case "tanpa_kadaluarsa":
      return (
        <>
          <th className="px-4 py-3">SK Penugasan</th>
          <th className="px-4 py-3">Tgl SK</th>
        </>
      );
  }
}

function RowExtraCell({
  kategori,
  u,
  pillClass,
}: {
  kategori: KandidatKategori;
  u: KandidatItem;
  pillClass: string;
}) {
  switch (kategori) {
    case "alumni":
      return (
        <>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{formatDate(u.tgl_lulus)}</td>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
            {u.sk_yudisium || <span className="text-gray-400">—</span>}
          </td>
        </>
      );
    case "mutasi":
      return (
        <>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{formatDate(u.tgl_keluar)}</td>
          <td className="px-4 py-3">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${pillClass}`}>
              {u.nm_jns_keluar || `Kode ${u.id_jns_keluar ?? "?"}`}
            </span>
          </td>
        </>
      );
    case "expired":
      return (
        <>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{formatDate(u.tgl_kadaluarsa)}</td>
          <td className="px-4 py-3">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillClass}`}>
              {u.days_overdue ?? "?"} hari
            </span>
          </td>
        </>
      );
    case "akan_expire":
      return (
        <>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{formatDate(u.tgl_kadaluarsa)}</td>
          <td className="px-4 py-3">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillClass}`}>
              {u.days_remaining ?? "?"} hari
            </span>
          </td>
        </>
      );
    case "tanpa_kadaluarsa":
      return (
        <>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
            {u.sk_penugasan || <span className="text-gray-400">—</span>}
          </td>
          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{formatDate(u.tgl_sk_penugasan)}</td>
        </>
      );
  }
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {children}
      </div>
    </div>
  );
}
