import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { AuthorChip } from "@/shared/components/AuthorChip";
import { KategoriBadge } from "@/shared/components/KategoriBadge";
import { TagChip } from "@/shared/components/TagChip";
import { PostReader } from "@/shared/components/PostReader";
import { PostCard } from "@/shared/components/PostCard";
import { ViewTracker } from "@/shared/components/ViewTracker";
import { LikeButton } from "@/shared/components/LikeButton";
import { BookmarkButton } from "@/shared/components/BookmarkButton";
import { ShareButtons } from "@/shared/components/ShareButtons";
import { Komentar } from "@/shared/components/Komentar";
import { ReportPostButton } from "@/shared/components/ReportPostButton";
import { JsonLd } from "@/shared/components/JsonLd";
import { ReadingProgress } from "@/shared/components/ReadingProgress";
import {
  getBlogBySubdomain, getBlogPostBySlug, getBlogPosts, getSeriesContextForPost,
  getCoAuthorsForPost, getRelatedPosts, CO_AUTHOR_LABEL,
} from "@/lib/api";
import { buildMetadata, buildBlogPostingJsonLd, buildOGImageURL } from "@/lib/seo";
import { formatNumber, readingTime } from "@/lib/utils";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ subdomain: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const [post, blog] = await Promise.all([
    getBlogPostBySlug(subdomain, slug),
    getBlogBySubdomain(subdomain),
  ]);
  if (!post) return buildMetadata({ title: "Post tidak ditemukan" });
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  return buildMetadata({
    title: post.judul,
    description: post.ringkasan || undefined,
    // Prefer the editor-supplied cover image; fall back to a dynamic branded
    // card so every shareable URL has a polished preview.
    image: post.cover_url || buildOGImageURL({
      title: post.judul,
      subtitle: post.kategori?.nm_kategori || undefined,
      author: post.author?.nm_tampilan || blog?.nm_tampilan || undefined,
      footer: `${subdomain}.${apex}`,
    }),
    url: `https://${subdomain}.${apex}/posts/${slug}`,
    type: "article",
    publishedTime: post.tgl_terbit || undefined,
    authors: post.author ? [post.author.nm_tampilan] : undefined,
    tags: post.tags?.map((t) => t.nm_tag),
    blogSeo: blog?.meta_seo_json as Parameters<typeof buildMetadata>[0]["blogSeo"],
    siteName: blog?.nm_blog,
    rssUrl: `https://${subdomain}.${apex}/rss`,
    rssTitle: `RSS — ${blog?.nm_blog || subdomain}`,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { subdomain, slug } = await params;
  const [blog, post, allPosts] = await Promise.all([
    getBlogBySubdomain(subdomain),
    getBlogPostBySlug(subdomain, slug),
    getBlogPosts(subdomain, { limit: 4 }),
  ]);

  if (!blog || !post) notFound();

  const related = allPosts.items.filter((p) => p.id_post !== post.id_post).slice(0, 3);
  const [seriesCtx, coAuthors, crossBlogRelated] = await Promise.all([
    getSeriesContextForPost(post.id_post),
    getCoAuthorsForPost(post.id_post),
    getRelatedPosts(post.id_post, 4),
  ]);
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  const postingJsonLd = buildBlogPostingJsonLd({
    subdomain,
    nm_blog: blog.nm_blog,
    nm_tampilan: blog.nm_tampilan,
    foto_url: blog.avatar_url,
    judul: post.judul,
    slug: post.slug,
    ringkasan: post.ringkasan,
    konten_html: post.konten_html,
    tgl_terbit: post.tgl_terbit,
    gambar_sampul: post.cover_url,
    kategori: post.kategori?.nm_kategori || null,
    tags: post.tags?.map((t) => t.nm_tag),
    apex,
    co_authors: coAuthors.map((ca) => ({
      subdomain: ca.subdomain,
      nm_tampilan: ca.nm_tampilan,
      avatar_url: ca.avatar_url,
    })),
  });

  return (
    <article>
      <JsonLd data={postingJsonLd} />
      <ReadingProgress idPost={post.id_post} />
      {/* Track view via Beacon API (fire-and-forget, dedup di server) */}
      <ViewTracker idPost={post.id_post} />

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {post.kategori && <KategoriBadge kategori={post.kategori} size="md" className="mb-4" />}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight text-balance">
          {post.judul}
        </h1>

        {post.ringkasan && (
          <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed text-pretty">
            {post.ringkasan}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-800">
          {post.author && <AuthorChip author={post.author} date={post.tgl_terbit} readingMinutes={post.waktu_baca_menit} size="md" apexLink={false} />}
        </div>

        {/* Co-authors byline. Linked to each contributor's tenant home so readers
            can explore other work by everyone credited on this post. */}
        {coAuthors.length > 0 && (
          <div className="mt-4 flex flex-wrap items-start gap-x-3 gap-y-2 text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Kontributor:</span>
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {coAuthors.map((ca) => (
                <li key={ca.id_blog_co} className="inline-flex items-center gap-1.5">
                  {ca.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ca.avatar_url}
                      alt={ca.nm_tampilan}
                      className="w-5 h-5 rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" />
                  )}
                  <a
                    href={`https://${ca.subdomain}.${process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}`}
                    className="font-medium text-slate-700 dark:text-slate-300 hover:text-myunila hover:underline"
                  >
                    {ca.nm_tampilan}
                  </a>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {CO_AUTHOR_LABEL[ca.peran]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Cover image */}
      {post.cover_url && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
            <Image
              src={post.cover_url}
              alt={post.judul}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.konten_html ? (
          <PostReader html={post.konten_html} />
        ) : (
          <p className="text-slate-500 italic">(Konten kosong)</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500 mr-2">Tags:</span>
            {post.tags.map((t) => <TagChip key={t.id_tag} tag={t} size="md" />)}
          </div>
        )}

        {/* Engagement bar */}
        <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><Eye className="w-4 h-4" />{formatNumber(post.jumlah_view)}</span>
            <LikeButton idPost={post.id_post} initialCount={post.jumlah_like} />
            <span className="inline-flex items-center gap-1.5 text-sm"><MessageCircle className="w-4 h-4" />{formatNumber(post.jumlah_komentar)}</span>
            <span className="hidden sm:inline">· {readingTime(post.waktu_baca_menit)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton idPost={post.id_post} />
            <ShareButtons
              url={`https://${subdomain}.${process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id"}/posts/${slug}`}
              title={post.judul}
              hashtags={post.tags?.map((t) => t.nm_tag.replace(/\s+/g, "")) || []}
            />
          </div>
        </div>
      </div>

      {/* Series navigation — shown when the post belongs to a series */}
      {seriesCtx?.series && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Bagian{" "}
                <strong className="text-myunila tabular-nums">{seriesCtx.index}</strong> dari{" "}
                <strong className="text-slate-700 dark:text-slate-300 tabular-nums">{seriesCtx.total}</strong>
              </p>
              <Link
                href={`/series/${seriesCtx.series.slug}`}
                className="text-xs font-semibold text-myunila hover:underline inline-flex items-center gap-1"
              >
                {seriesCtx.series.judul} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seriesCtx.prev ? (
                <Link
                  href={`/posts/${seriesCtx.prev.slug}`}
                  className="group flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-myunila/40 hover:bg-white dark:hover:bg-slate-900 transition-all"
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">← Sebelumnya</span>
                  <span className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2">
                    {seriesCtx.prev.judul}
                  </span>
                </Link>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Ini bagian pertama</span>
                </div>
              )}
              {seriesCtx.next ? (
                <Link
                  href={`/posts/${seriesCtx.next.slug}`}
                  className="group flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-myunila/40 hover:bg-white dark:hover:bg-slate-900 transition-all sm:text-right"
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Selanjutnya →</span>
                  <span className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2">
                    {seriesCtx.next.judul}
                  </span>
                </Link>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Ini bagian terakhir</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Komentar section — public read + auth/anonymous create */}
      <Komentar idPost={post.id_post} />

      {/* Report link — discreet, di footer post */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 -mt-4 text-right">
        <ReportPostButton idPost={post.id_post} />
      </div>

      {/* Author bio footer */}
      {post.author && (
        <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start gap-4">
              {post.author.avatar_url && (
                <Image src={post.author.avatar_url} alt={post.author.nm_tampilan} width={80} height={80} className="rounded-full ring-2 ring-white dark:ring-slate-800 shadow-md" />
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Tentang Penulis</p>
                <h3 className="mt-1 text-xl font-display font-bold">{post.author.nm_tampilan}</h3>
                {post.author.bio && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{post.author.bio}</p>}
                <Link href="/about" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-myunila hover:underline">
                  Lihat semua artikel →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related posts dari blog yang sama */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-display font-bold mb-6">Artikel Terkait dari {blog.nm_tampilan}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => <PostCard key={p.id_post} post={p} showAuthor={false} />)}
          </div>
        </section>
      )}

      {/* Bacaan Lain — cross-blog recommendations via Meilisearch on tags+kategori.
          Filtered to exclude posts already shown in the same-blog "Artikel Terkait"
          block above so readers don't see duplicates. */}
      {crossBlogRelated.length > 0 && (() => {
        const seen = new Set(related.map((p) => p.id_post));
        seen.add(post.id_post);
        const filtered = crossBlogRelated.filter((p) => !seen.has(p.id_post)).slice(0, 4);
        if (filtered.length === 0) return null;
        return (
          <section className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Topik Serupa</p>
                <h2 className="text-2xl font-display font-bold">Bacaan Lain di Blog Unila</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tulisan terkait dari penulis lain — kurasi otomatis berdasarkan kategori &amp; tag.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((p) => <PostCard key={p.id_post} post={p} variant="compact" />)}
              </div>
            </div>
          </section>
        );
      })()}
    </article>
  );
}
