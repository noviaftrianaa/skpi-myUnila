"use client";

// Admin: Semua Blog — list cross-blog dengan filter + toggle a_terverifikasi/a_aktif.
// Verify = centang biru (legit user). Suspend = a_aktif=false (blog hilang dari apex).

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheckCircle, FiExternalLink, FiLoader, FiSearch, FiSlash, FiUserCheck, FiUserX,
} from "react-icons/fi";
import { useState } from "react";
import { useAdminSetBlogFlags, useBlogList } from "@/lib/services/blog-platform";
import type { BlogSummary } from "@/lib/services/blog-platform";

const PAGE_SIZE = 30;
const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

type RoleFilter = "" | "MHS" | "STAF" | "DOSEN" | "ALUMNI";

export default function AdminBlogsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("");
  const [offset, setOffset] = useState(0);
  const setFlags = useAdminSetBlogFlags();
  const [actingId, setActingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useBlogList({
    search: search || undefined,
    role: filterRole || undefined,
    aktifOnly: false, // admin lihat semua termasuk suspended
    order: "latest",
    limit: PAGE_SIZE,
    offset,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  const handleToggleVerify = async (b: BlogSummary) => {
    setActingId(b.id_blog);
    try {
      await setFlags.mutateAsync({
        id: b.id_blog,
        input: { a_terverifikasi: !b.a_terverifikasi },
      });
      refetch();
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleToggleAktif = async (b: BlogSummary) => {
    if (b.a_aktif && !confirm(`Suspend blog "${b.subdomain}"?\n\nBlog tidak akan muncul di apex feed/tenant. Bisa dibuka kembali kapan saja.`)) return;
    setActingId(b.id_blog);
    try {
      await setFlags.mutateAsync({
        id: b.id_blog,
        input: { a_aktif: !b.a_aktif },
      });
      refetch();
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setOffset(0);
  };

  // Derived stats from current page (not global, but representative)
  const stats = {
    totalShown: items.length,
    aktif: items.filter((b) => b.a_aktif).length,
    verified: items.filter((b) => b.a_terverifikasi).length,
    suspended: items.filter((b) => !b.a_aktif).length,
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Manajemen</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">Semua Blog</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
          Daftar semua blog civitas yang sudah klaim subdomain. Verify legit user atau suspend bad actor.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari subdomain / nama blog / nama tampilan..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/40"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value as RoleFilter); setOffset(0); }}
          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">Semua Role</option>
          <option value="MHS">Mahasiswa</option>
          <option value="STAF">Staf/Tendik</option>
          <option value="DOSEN">Dosen</option>
          <option value="ALUMNI">Alumni</option>
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700"
        >
          Cari
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total" value={total} />
        <StatBox label="Ditampilkan" value={stats.totalShown} />
        <StatBox label="Verified (page)" value={stats.verified} accent="text-myunila" />
        <StatBox label="Suspended (page)" value={stats.suspended} accent="text-rose-600" />
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Subdomain</th>
                  <th className="px-4 py-3">Nama Tampilan</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Posts</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Followers</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                      Tidak ada blog yang cocok dengan filter.
                    </td>
                  </tr>
                )}
                {items.map((b) => {
                  const acting = actingId === b.id_blog;
                  return (
                    <tr key={b.id_blog} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-mono text-xs font-medium">
                        <a
                          href={`https://${b.subdomain}.${APEX_HOST}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-myunila hover:underline inline-flex items-center gap-1"
                        >
                          {b.subdomain}
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {b.nm_tampilan || b.nm_blog}
                        </span>
                        {b.a_terverifikasi && (
                          <FiCheckCircle className="inline ml-1 w-3.5 h-3.5 text-myunila" title="Verified" />
                        )}
                        <p className="text-[11px] text-slate-500 truncate max-w-[280px]">{b.tagline || b.nm_blog}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {b.tipe_role_kode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm">{b.jumlah_post.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm">{b.jumlah_view.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm">{b.jumlah_follower.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        {b.a_aktif ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <FiCheckCircle className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                            <FiSlash className="w-3.5 h-3.5" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVerify(b)}
                          disabled={acting}
                          className={`text-xs px-2 py-1 rounded border disabled:opacity-50 inline-flex items-center gap-1 ${
                            b.a_terverifikasi
                              ? "border-myunila bg-myunila/10 text-myunila"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={b.a_terverifikasi ? "Klik untuk unverify" : "Klik untuk verify"}
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          {b.a_terverifikasi ? "Verified" : "Verify"}
                        </button>
                        {b.a_aktif ? (
                          <button
                            onClick={() => handleToggleAktif(b)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <FiUserX className="w-3 h-3" /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleAktif(b)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <FiUserCheck className="w-3 h-3" /> Aktifkan
                          </button>
                        )}
                        {acting && <FiLoader className="inline w-3 h-3 text-myunila animate-spin ml-1" />}
                      </td>
                    </tr>
                  );
                })}
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
      <CardBody className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 tabular-nums ${accent || "text-slate-900 dark:text-slate-100"}`}>
          {value.toLocaleString()}
        </p>
      </CardBody>
    </Card>
  );
}
