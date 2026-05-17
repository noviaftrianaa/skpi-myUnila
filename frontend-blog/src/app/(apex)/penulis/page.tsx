import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, FileText, Search, Users } from "lucide-react";
import { getAuthors } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { formatNumber, getBlogUrl } from "@/lib/utils";

export const revalidate = 600;

export const metadata = buildMetadata({
  title: "Penulis",
  description: "Jelajahi semua penulis aktif di Blog Unila — mahasiswa, dosen, dan staf yang membagikan tulisan mereka.",
});

const ROLE_LABEL: Record<string, string> = {
  MHS: "Mahasiswa",
  STAF: "Staf/Tendik",
  DOSEN: "Dosen",
  ALUMNI: "Alumni",
};

const ROLE_COLOR: Record<string, string> = {
  MHS: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  STAF: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  DOSEN: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  ALUMNI: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
};

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; order?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export default async function PenulisPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = sp.q || "";
  const role = (sp.role as "MHS" | "STAF" | "DOSEN" | "ALUMNI" | undefined) || "";
  const order = (sp.order as "popular" | "latest" | "alphabetical" | undefined) || "popular";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const offset = (page - 1) * PAGE_SIZE;

  const result = await getAuthors({ search, role, order, limit: PAGE_SIZE, offset });
  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  // Build query helper untuk pagination links
  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (role) params.set("role", role);
    if (order && order !== "popular") params.set("order", order);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-myunila/10 text-myunila flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">Penulis Blog Unila</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {formatNumber(result.total)} penulis aktif — mahasiswa, dosen, dan staf yang membagikan tulisan.
          </p>
        </div>
      </header>

      {/* Search + filter */}
      <form className="mb-6 flex flex-wrap gap-3 items-center" action="/penulis">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Cari nama / subdomain..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/40"
          />
        </div>
        <select name="role" defaultValue={role} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
          <option value="">Semua Role</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="order" defaultValue={order} className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
          <option value="popular">Terpopuler</option>
          <option value="latest">Terbaru</option>
          <option value="alphabetical">A-Z</option>
        </select>
        <button type="submit" className="h-10 px-4 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700">
          Cari
        </button>
        {(search || role || order !== "popular") && (
          <Link href="/penulis" className="text-xs text-slate-500 hover:text-myunila underline">
            Reset
          </Link>
        )}
      </form>

      {/* Results */}
      {result.items.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Tidak ada penulis yang cocok dengan filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {result.items.map((a) => (
            <Link
              key={a.id_blog}
              href={getBlogUrl(a.subdomain)}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-myunila/10 hover:border-myunila/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-3">
                {a.avatar_url ? (
                  <Image
                    src={a.avatar_url}
                    alt={a.nm_tampilan}
                    width={48}
                    height={48}
                    className="rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-1 inline-flex items-center gap-1">
                    {a.nm_tampilan}
                    {a.a_terverifikasi && <CheckCircle2 className="w-3.5 h-3.5 text-myunila flex-shrink-0" />}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">@{a.subdomain}</p>
                  <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${ROLE_COLOR[a.tipe_role] || ROLE_COLOR.MHS}`}>
                    {ROLE_LABEL[a.tipe_role] || a.tipe_role}
                  </span>
                </div>
              </div>
              {a.tagline && (
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{a.tagline}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {a.jumlah_post}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" /> {formatNumber(a.jumlah_follower)}
                </span>
                <span className="font-mono text-slate-400">{formatNumber(a.jumlah_view)} views</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-between text-sm">
          <p className="text-slate-500 tabular-nums">
            Hal {page} dari {totalPages} · {formatNumber(result.total)} penulis
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/penulis${buildQuery({ page: page - 1 })}`}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sebelumnya
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 opacity-40">
                Sebelumnya
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/penulis${buildQuery({ page: page + 1 })}`}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Selanjutnya
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 opacity-40">
                Selanjutnya
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
