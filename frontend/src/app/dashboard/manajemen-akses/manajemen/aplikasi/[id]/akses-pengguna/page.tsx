"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  aplikasiService,
  type AksesPenggunaResult,
  type AksesVia,
  type AksesPenggunaPeranSummary,
} from "@/lib/services/manakses/aplikasiService";

const VIA_META: Record<AksesVia, { label: string; pill: string; chip: string; ring: string }> = {
  identitas: {
    label: "Identitas",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    chip: "border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20",
    ring: "ring-blue-400/40",
  },
  fungsional: {
    label: "Fungsional",
    pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    chip: "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20",
    ring: "ring-emerald-400/40",
  },
  universal: {
    label: "Universal",
    pill: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    chip: "border-purple-200 bg-purple-50 dark:border-purple-800/40 dark:bg-purple-900/20",
    ring: "ring-purple-400/40",
  },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function useDebounced<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function AksesPenggunaPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const appId = params.id;

  const [data, setData] = useState<AksesPenggunaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(Number(search.get("page") || 1));
  const [limit, setLimit] = useState(Number(search.get("limit") || 25));
  const [searchTerm, setSearchTerm] = useState(search.get("search") || "");
  const [filterVia, setFilterVia] = useState<AksesVia | "">((search.get("akses_via") as AksesVia) || "");
  const [filterPeran, setFilterPeran] = useState<number | "">(
    search.get("id_peran") ? Number(search.get("id_peran")) : ""
  );
  const debouncedSearch = useDebounced(searchTerm, 300);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await aplikasiService.getAksesPengguna(appId, {
          page,
          limit,
          search: debouncedSearch || undefined,
          id_peran: filterPeran || undefined,
          akses_via: filterVia || undefined,
        });
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || "Gagal memuat data akses pengguna.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [appId, page, limit, debouncedSearch, filterPeran, filterVia]);

  // Reset ke page 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterPeran, filterVia, limit]);

  const peranList = useMemo<AksesPenggunaPeranSummary[]>(() => {
    return data?.summary?.per_peran || [];
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      {/* Breadcrumb + Title */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Link href="/dashboard/manajemen-akses" className="hover:text-blue-600 dark:hover:text-blue-400">
            Manajemen Akses
          </Link>
          <Icon icon="heroicons:chevron-right" className="h-3 w-3" />
          <Link
            href="/dashboard/manajemen-akses/manajemen/aplikasi"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Aplikasi
          </Link>
          <Icon icon="heroicons:chevron-right" className="h-3 w-3" />
          <span className="text-gray-700 dark:text-slate-300">Akses Pengguna</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.app?.nm_aplikasi || (loading ? "Memuat…" : "Akses Pengguna")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              Daftar pengguna yang memiliki akses ke aplikasi ini (read-only).
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Icon icon="heroicons:arrow-left" className="h-4 w-4" />
            Kembali
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon="heroicons:users"
          iconClass="bg-gray-500"
          label="Total Pengguna"
          value={data?.summary?.total_user ?? 0}
          loading={loading}
        />
        <SummaryCard
          icon="heroicons:academic-cap"
          iconClass="bg-blue-500"
          label="Akses Identitas"
          value={data?.summary?.total_identitas ?? 0}
          loading={loading}
        />
        <SummaryCard
          icon="heroicons:briefcase"
          iconClass="bg-emerald-500"
          label="Akses Fungsional"
          value={data?.summary?.total_fungsional ?? 0}
          loading={loading}
        />
        <SummaryCard
          icon="heroicons:shield-check"
          iconClass="bg-purple-500"
          label="Universal"
          value={data?.summary?.total_universal ?? 0}
          loading={loading}
        />
      </div>

      {/* Per-peran chips with filter */}
      {peranList.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center gap-2">
            <Icon icon="heroicons:identification" className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Peran dengan Akses</h3>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              ({peranList.length} peran)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterPeran("")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filterPeran === ""
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Semua peran
            </button>
            {peranList.map((p) => {
              const meta = VIA_META[p.akses_via];
              const active = filterPeran === p.id_peran;
              return (
                <button
                  key={p.id_peran}
                  type="button"
                  onClick={() => setFilterPeran(active ? "" : p.id_peran)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? `border-transparent ring-2 ${meta.ring} ${meta.chip} text-gray-900 dark:text-white`
                      : `${meta.chip} text-gray-700 hover:opacity-80 dark:text-slate-200`
                  }`}
                >
                  <span>{p.nm_peran}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                    {p.jumlah_user}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Icon
              icon="heroicons:magnifying-glass"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, username, atau email..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterVia}
            onChange={(e) => setFilterVia(e.target.value as AksesVia | "")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
          >
            <option value="">Semua sumber akses</option>
            <option value="identitas">Identitas (default)</option>
            <option value="fungsional">Fungsional (menu_role)</option>
            <option value="universal">Universal (super)</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <span>Per halaman:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
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
        ) : !data || data.pengguna.data.length === 0 ? (
          <div className="p-12 text-center">
            <Icon icon="heroicons:user-group" className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              Tidak ada pengguna ditemukan
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/40">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <th className="px-4 py-3">Pengguna</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Sumber Akses</th>
                  <th className="px-4 py-3">Unit Organisasi</th>
                  <th className="px-4 py-3">SK Penugasan</th>
                  <th className="px-4 py-3">Tgl SK</th>
                  <th className="px-4 py-3">Aktif Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {data.pengguna.data.map((u) => {
                  const via = VIA_META[u.akses_via];
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
                      className="transition hover:bg-gray-50/60 dark:hover:bg-slate-700/30"
                    >
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
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-700 dark:text-slate-200">
                          {u.nm_peran}
                        </div>
                        <div className="mt-0.5 text-[10px] text-gray-400">ID #{u.id_peran}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${via.pill}`}
                        >
                          <Icon
                            icon={
                              u.akses_via === "identitas"
                                ? "heroicons:academic-cap"
                                : u.akses_via === "fungsional"
                                ? "heroicons:briefcase"
                                : "heroicons:shield-check"
                            }
                            className="h-3 w-3"
                          />
                          {via.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {u.nm_organisasi || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {u.sk_penugasan || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                        {formatDate(u.tgl_sk_penugasan)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                        {formatDate(u.last_active)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pengguna.total > 0 && (
          <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row dark:border-slate-700">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Menampilkan {(data.pengguna.page - 1) * data.pengguna.limit + 1}–
              {Math.min(data.pengguna.page * data.pengguna.limit, data.pengguna.total)} dari{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {data.pengguna.total}
              </span>{" "}
              pengguna
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
                Hal. <span className="font-semibold text-gray-900 dark:text-white">{data.pengguna.page}</span>
                {" / "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.pengguna.total_pages}
                </span>
              </span>
              <button
                type="button"
                disabled={page >= data.pengguna.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/15 dark:text-blue-300">
        <div className="flex gap-2">
          <Icon icon="heroicons:information-circle" className="h-4 w-4 flex-shrink-0" />
          <span>
            Halaman ini bersifat <strong>read-only</strong>. Pengelolaan akses (tambah/edit/perpanjang)
            dilakukan terpusat di Manajemen Akses Pusat oleh UPT TIK. Sumber akses:
            <strong> Identitas</strong> (default ke Mhs/Dosen/Tendik), <strong>Fungsional</strong> (mapping
            menu_role + SK), <strong>Universal</strong> (super role).
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  iconClass,
  label,
  value,
  loading,
}: {
  icon: string;
  iconClass: string;
  label: string;
  value: number;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white ${iconClass}`}
        >
          <Icon icon={icon} className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200 dark:bg-slate-700" /> : value.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}
