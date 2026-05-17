import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { AuthorProfileHero } from "@/shared/components/AuthorProfileHero";
import { AuthorCV } from "@/shared/components/AuthorCV";
import { PostCard } from "@/shared/components/PostCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { TagChip } from "@/shared/components/TagChip";
import { JsonLd } from "@/shared/components/JsonLd";
import { getBlogBySubdomain, getBlogPosts, getPinnedPosts } from "@/lib/api";
import { buildMetadata, buildBlogJsonLd, buildOGImageURL } from "@/lib/seo";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) return buildMetadata({ title: "Blog tidak ditemukan" });
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  return buildMetadata({
    title: `${blog.nm_tampilan} — ${blog.nm_blog}`,
    description: blog.tagline || blog.bio || `Blog ${blog.nm_tampilan} di Unila.`,
    // Use the user-supplied cover when present, otherwise generate a branded
    // card via the OG renderer so every page has a usable share image.
    image: blog.cover_url || buildOGImageURL({
      title: blog.nm_blog,
      subtitle: blog.tagline || undefined,
      author: blog.nm_tampilan || undefined,
      footer: `${subdomain}.${apex}`,
    }),
    url: `https://${subdomain}.${apex}`,
  });
}

export default async function TenantHomePage({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) notFound();

  const [postsResult, pinnedPosts] = await Promise.all([
    getBlogPosts(subdomain, { limit: 6 }),
    getPinnedPosts(subdomain),
  ]);
  // Filter out pinned posts from the "Artikel Terbaru" list to avoid duplicates.
  const pinnedIDs = new Set(pinnedPosts.map((p) => p.id_post));
  const recentNonPinned = postsResult.items.filter((p) => !pinnedIDs.has(p.id_post));
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  const blogJsonLd = buildBlogJsonLd({
    subdomain,
    nm_blog: blog.nm_blog,
    nm_tampilan: blog.nm_tampilan,
    bio: blog.bio,
    tagline: blog.tagline,
    foto_url: blog.avatar_url,
    apex,
  });

  // Top tags from this blog's posts
  const tagMap = new Map<string, { slug: string; nm_tag: string; count: number }>();
  postsResult.items.forEach((p) => p.tags?.forEach((t) => {
    const cur = tagMap.get(t.slug);
    tagMap.set(t.slug, { slug: t.slug, nm_tag: t.nm_tag, count: (cur?.count || 0) + 1 });
  }));
  const topBlogTags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count).slice(0, 8);

  // Template-based rendering — phase 1: minimalist + modern (default).
  // Phase 2: full custom rendering per template (magazine/academic/gallery/devlog/portfolio).
  const isMinimalist = blog.kode_template === "minimalist";

  // ============= MINIMALIST VARIANT =============
  if (isMinimalist) {
    return (
      <>
        <JsonLd data={blogJsonLd} />
        <AuthorProfileHero author={blog} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl font-bold tracking-tight">Tulisan</h2>
              <Link href="/archive" className="text-sm text-myunila hover:underline inline-flex items-center gap-1">
                Arsip <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {postsResult.items.length === 0 ? (
              <EmptyState title="Belum ada tulisan" message={`${blog.nm_tampilan} belum mempublikasikan tulisan.`} />
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {postsResult.items.map((p) => (
                  <PostCard key={p.id_post} post={p} variant="list" showAuthor={false} className="!py-6" />
                ))}
              </div>
            )}
          </section>

          {blog.cv_json && (
            <section className="pt-12 border-t border-slate-200 dark:border-slate-800">
              <h2 className="font-serif text-3xl font-bold mb-8">Tentang Penulis</h2>
              <AuthorCV cv={blog.cv_json} />
            </section>
          )}
        </div>
      </>
    );
  }

  // ============= MODERN VARIANT (default) =============
  // Catatan: template magazine/academic/gallery/devlog/portfolio fall back ke modern di phase 1.
  // Indicator template aktif tampil di TenantHeader sebagai badge "🎨 {kode}".
  return (
    <>
      <JsonLd data={blogJsonLd} />
      <AuthorProfileHero author={blog} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content (left, 2/3) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Pinned by author — sticky highlights, capped at 3 by backend */}
          {pinnedPosts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-myunila" />
                <h2 className="text-xl font-display font-bold">Disematkan oleh {blog.nm_tampilan}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedPosts.map((p) => <PostCard key={p.id_post} post={p} variant="compact" showAuthor={false} />)}
              </div>
            </section>
          )}

          {/* Recent posts */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Artikel Terbaru</h2>
              <Link href="/archive" className="text-sm font-medium text-myunila hover:underline inline-flex items-center gap-1">
                Lihat semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentNonPinned.length === 0 ? (
              <EmptyState title="Belum ada artikel" message={`${blog.nm_tampilan} belum mempublikasikan artikel.`} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {recentNonPinned.map((p) => <PostCard key={p.id_post} post={p} showAuthor={false} />)}
              </div>
            )}
          </section>

          {/* CV / Portfolio sections */}
          {blog.cv_json && (
            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-myunila" />
                <h2 className="text-2xl font-display font-bold">Portofolio & CV</h2>
              </div>
              <AuthorCV cv={blog.cv_json} />
            </section>
          )}
        </div>

        {/* Sidebar (right, 1/3) */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Template indicator (kalau bukan default modern) */}
          {blog.kode_template && blog.kode_template !== "modern" && (
            <SidebarBox title="🎨 Template">
              <p className="text-sm font-semibold capitalize">{blog.kode_template}</p>
              <p className="text-xs text-slate-500 mt-1">
                Template ini akan dirender penuh di phase 2.
                Saat ini fallback ke <strong>modern</strong>.
              </p>
            </SidebarBox>
          )}

          {topBlogTags.length > 0 && (
            <SidebarBox title="Topik yang Ditulis">
              <div className="flex flex-wrap gap-2">
                {topBlogTags.map((t) => <TagChip key={t.slug} tag={t} />)}
              </div>
            </SidebarBox>
          )}

          <SidebarBox title="Hubungi Penulis">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Lihat profil sosmed di hero atas, atau klik sosial media di sana untuk kontak.
            </p>
            <p className="text-xs text-slate-500">
              ℹ️ Email pribadi & telepon tidak ditampilkan untuk privasi.
            </p>
          </SidebarBox>

          <SidebarBox title="Bagikan Profil">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Twitter",  href: `https://twitter.com/intent/tweet?text=Cek+blog+${encodeURIComponent(blog.nm_tampilan)}+di+Unila` },
                { label: "WhatsApp", href: `https://wa.me/?text=Blog+${encodeURIComponent(blog.nm_tampilan)}` },
                { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/` },
                { label: "Telegram", href: `https://t.me/share/url?text=Blog+${encodeURIComponent(blog.nm_tampilan)}` },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
                  {s.label}
                </a>
              ))}
            </div>
          </SidebarBox>
        </aside>
      </div>
    </>
  );
}

function SidebarBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-display font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
