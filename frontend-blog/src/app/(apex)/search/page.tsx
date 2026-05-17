import Link from "next/link";
import { SearchBar } from "@/shared/components/SearchBar";
import { PostCard } from "@/shared/components/PostCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { searchPosts } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import type { Post } from "@/types/blog";

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: "latest" | "trending"; page?: string }>;
}

const PAGE_SIZE = 20;

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = await searchParams;
  return buildMetadata({
    title: sp.q ? `Cari: ${sp.q}` : "Cari",
    description: `Hasil pencarian artikel di Blog Unila${sp.q ? ` untuk "${sp.q}"` : ""}.`,
  });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const sort = sp.sort;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const empty = { items: [], total: 0, page: 1, limit: PAGE_SIZE, highlights: {} as Record<string, { judul?: string; ringkasan?: string; konten_text?: string }> };
  const results = q
    ? await searchPosts(q, { limit: PAGE_SIZE, offset, sort })
    : empty;

  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE));
  const baseQs = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (sort) next.set("sort", sort);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === null || v === "") continue;
      next.set(k, String(v));
    }
    return next.toString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">Pencarian</h1>
        <SearchBar size="lg" defaultValue={q} />
      </div>

      {q && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {results.total > 0 ? (
                <>
                  Menampilkan <strong>{results.total}</strong> hasil untuk &ldquo;<strong className="text-slate-900 dark:text-slate-100">{q}</strong>&rdquo;
                </>
              ) : (
                <>Tidak ada hasil untuk &ldquo;<strong>{q}</strong>&rdquo;</>
              )}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1">Urutkan:</span>
              {[
                { v: undefined,    l: "Relevansi" },
                { v: "latest" as const,    l: "Terbaru" },
                { v: "trending" as const,  l: "Terpopuler" },
              ].map((opt) => {
                const isActive = sort === opt.v;
                return (
                  <Link
                    key={opt.l}
                    href={`/search?${baseQs({ sort: opt.v, page: 1 })}`}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      isActive
                        ? "bg-myunila text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {opt.l}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!q ? (
        <EmptyState title="Cari Artikel" message="Mulai dengan mengetik kata kunci di atas. Coba: Next.js, Beasiswa, Skripsi, atau topik favoritmu." />
      ) : results.items.length === 0 ? (
        <EmptyState title="Tidak ditemukan" message="Coba kata kunci lain — pencarian toleran terhadap typo, atau jelajahi kategori populer." />
      ) : (
        <>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {results.items.map((p) => {
              const hl = results.highlights[p.id_post];
              return (
                <li key={p.id_post}>
                  <SearchHit post={p} highlightJudul={hl?.judul} highlightRingkasan={hl?.ringkasan} />
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between text-sm">
              <p className="text-slate-500 tabular-nums">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/search?${baseQs({ page: page - 1 })}`}
                    className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/search?${baseQs({ page: page + 1 })}`}
                    className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Selanjutnya →
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

// SearchHit — like PostCard list variant but renders <mark>-highlighted title +
// ringkasan when Meilisearch returns formatted matches. Trusts the backend to
// have escaped user content; the `<mark>` tags themselves are server-emitted.
function SearchHit({ post, highlightJudul, highlightRingkasan }: {
  post: Post;
  highlightJudul?: string;
  highlightRingkasan?: string;
}) {
  const url = post.author?.subdomain
    ? `https://${post.author.subdomain}.${process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}/posts/${post.slug}`
    : `/posts/${post.slug}`;

  if (!highlightJudul && !highlightRingkasan) {
    return <PostCard post={post} variant="list" />;
  }

  return (
    <article className="py-5">
      <Link href={url} className="group block">
        <h2
          className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2 [&_mark]:bg-yellow-100 [&_mark]:dark:bg-yellow-900/40 [&_mark]:text-slate-900 [&_mark]:dark:text-slate-100 [&_mark]:px-0.5 [&_mark]:rounded"
          dangerouslySetInnerHTML={{ __html: highlightJudul || post.judul }}
        />
        {(highlightRingkasan || post.ringkasan) && (
          <p
            className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 [&_mark]:bg-yellow-100 [&_mark]:dark:bg-yellow-900/40 [&_mark]:text-slate-700 [&_mark]:dark:text-slate-200 [&_mark]:px-0.5 [&_mark]:rounded"
            dangerouslySetInnerHTML={{ __html: highlightRingkasan || post.ringkasan || "" }}
          />
        )}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 tabular-nums">
          {post.author && <span>@{post.author.subdomain}</span>}
          <span>{post.jumlah_view.toLocaleString()} views</span>
          <span>·</span>
          <span>{post.waktu_baca_menit} mnt baca</span>
        </div>
      </Link>
    </article>
  );
}

