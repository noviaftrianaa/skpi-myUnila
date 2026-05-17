import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Eye, MessageCircle, Heart } from "lucide-react";
import { getBlogBySubdomain, getSeriesBySlug } from "@/lib/api";
import { buildMetadata, buildOGImageURL } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ subdomain: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const [series, blog] = await Promise.all([
    getSeriesBySlug(subdomain, slug),
    getBlogBySubdomain(subdomain),
  ]);
  if (!series) return buildMetadata({ title: "Series tidak ditemukan" });
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  return buildMetadata({
    title: series.series.judul,
    description: series.series.deskripsi || `Series oleh ${blog?.nm_tampilan || subdomain}.`,
    image: series.series.cover_url || buildOGImageURL({
      title: series.series.judul,
      subtitle: `Series · ${series.series.jumlah_post} post`,
      author: blog?.nm_tampilan || undefined,
      footer: `${subdomain}.${apex}`,
    }),
    url: `https://${subdomain}.${apex}/series/${slug}`,
  });
}

export default async function SeriesPage({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const [blog, detail] = await Promise.all([
    getBlogBySubdomain(subdomain),
    getSeriesBySlug(subdomain, slug),
  ]);
  if (!blog || !detail) notFound();
  const { series, posts } = detail;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wider text-myunila font-semibold mb-2 inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Series · {posts.length} post
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight text-balance">
          {series.judul}
        </h1>
        {series.deskripsi && (
          <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed text-pretty">
            {series.deskripsi}
          </p>
        )}
        <p className="mt-4 text-sm text-slate-500">
          oleh{" "}
          <Link href="/" className="font-semibold text-myunila hover:underline">
            {blog.nm_tampilan}
          </Link>
        </p>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center">Belum ada post di series ini.</p>
      ) : (
        <ol className="space-y-6">
          {posts.map((p, idx) => (
            <li key={p.id_post} className="relative">
              <Link
                href={`/posts/${p.slug}`}
                className="group flex gap-4 items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-myunila/40 hover:shadow-sm bg-white dark:bg-slate-900 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-myunila/10 text-myunila flex items-center justify-center text-lg font-bold tabular-nums">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2 transition-colors">
                    {p.judul}
                  </h2>
                  {p.ringkasan && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.ringkasan}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatNumber(p.jumlah_view)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {p.jumlah_like}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {p.jumlah_komentar}
                    </span>
                    <span>·</span>
                    <span>{p.waktu_baca_menit} mnt baca</span>
                  </div>
                </div>
                {p.cover_url && (
                  <div className="hidden sm:block flex-shrink-0 relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image src={p.cover_url} alt={p.judul} fill className="object-cover" sizes="96px" />
                  </div>
                )}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-myunila flex-shrink-0 self-center transition-colors" />
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-12 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke {blog.nm_tampilan}
        </Link>
      </div>
    </article>
  );
}
