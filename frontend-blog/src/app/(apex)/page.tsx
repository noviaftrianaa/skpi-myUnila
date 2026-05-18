import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, FileText, Flame, Users } from "lucide-react";
import { SearchBar } from "@/shared/components/SearchBar";
import { PostCard } from "@/shared/components/PostCard";
import { TagChip } from "@/shared/components/TagChip";
import { JsonLd } from "@/shared/components/JsonLd";
import { getFeatured, getFeaturedAuthors, getKategori, getLatest, getTopAuthors, getTopTags, getTrending } from "@/lib/api";
import { formatNumber, getBlogUrl } from "@/lib/utils";
import { buildMetadata, buildOGImageURL, buildWebSiteJsonLd } from "@/lib/seo";
import Image from "next/image";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: undefined, // use default site name
  description: "Wadah publikasi civitas akademik Universitas Lampung. Jelajahi artikel terbaik dari mahasiswa, dosen, dan staf.",
  image: buildOGImageURL({
    title: "Blog Unila",
    subtitle: "Suara Civitas Akademik",
    footer: "blog.unila.ac.id",
  }),
  rssUrl: "/rss",
  rssTitle: "Blog Unila — Semua Post Terbaru",
});

export default async function HomePage() {
  const [trending, latest, featured, kategori, topAuthors, topTags, featuredAuthors] = await Promise.all([
    getTrending(6),
    getLatest(9),
    getFeatured(3),
    getKategori(),
    getTopAuthors(8),
    getTopTags(20),
    getFeaturedAuthors(8),
  ]);

  const totalPosts = kategori.reduce((sum, k) => sum + k.jumlah_post, 0);
  const totalAuthors = topAuthors.length * 70; // estimasi
  const totalViews = trending.reduce((sum, p) => sum + p.jumlah_view, 0) * 50;

  return (
    <>
      <JsonLd data={buildWebSiteJsonLd()} />
      {/* Hero Search Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-myunila-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 opacity-30 dark:opacity-10" aria-hidden>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-myunila/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-balance">
            Suara <span className="text-myunila">Civitas Akademik</span> Universitas Lampung
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 text-pretty">
            Jelajahi {formatNumber(totalPosts)}+ artikel dari {formatNumber(totalAuthors)}+ penulis — mahasiswa, dosen, dan staf Unila.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar size="lg" />
          </div>

          {/* Suggestion chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {topTags.slice(0, 6).map((t) => (
              <TagChip key={t.id_tag} tag={t} size="md" />
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Stat icon={FileText} label="Artikel" value={formatNumber(totalPosts)} />
            <Stat icon={Users}    label="Penulis"    value={formatNumber(totalAuthors)} />
            <Stat icon={Eye}      label="Dibaca"     value={formatNumber(totalViews)} />
            <Stat icon={Flame}    label="Trending"   value="Live" />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold inline-flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Trending Minggu Ini
          </h2>
          <Link href="/trending" className="text-sm font-medium text-myunila hover:underline inline-flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((p) => <PostCard key={p.id_post} post={p} />)}
        </div>
      </section>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">⭐ Artikel Pilihan</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PostCard post={featured[0]} variant="featured" className="lg:col-span-2" />
              <div className="space-y-6">
                {featured.slice(1).map((p) => <PostCard key={p.id_post} post={p} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section id="kategori" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">Jelajahi Kategori</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {kategori.slice(0, 12).map((k) => (
            <Link
              key={k.id_kategori_post}
              href={`/kategori/${k.slug}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md hover:border-myunila/40 transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 font-display text-base font-bold"
                style={{ backgroundColor: `${k.warna || "#3B82F6"}15`, color: k.warna || "#3B82F6" }}
              >
                {k.nm_kategori.charAt(0)}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-myunila transition-colors">
                {k.nm_kategori}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatNumber(k.jumlah_post)} artikel</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="bg-slate-50 dark:bg-slate-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Artikel Terbaru</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.items.map((p) => <PostCard key={p.id_post} post={p} />)}
          </div>
        </div>
      </section>

      {/* Featured Authors — verified only (Quick Win polish) */}
      {featuredAuthors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold inline-flex items-center gap-2">
              <BadgeCheck className="w-6 h-6 text-myunila" />
              Penulis Terverifikasi
            </h2>
            <span className="text-xs text-slate-500">
              Dosen & staf yang sudah lulus verifikasi admin
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredAuthors.map((a) => (
              <Link
                key={a.id_blog}
                href={getBlogUrl(a.subdomain)}
                className="group flex-shrink-0 snap-start w-64 sm:w-72 flex flex-col items-center text-center p-5 rounded-xl bg-gradient-to-br from-myunila-50/40 to-blue-50/30 dark:from-slate-900 dark:to-slate-950 border border-myunila/20 hover:border-myunila hover:shadow-lg hover:shadow-myunila/10 hover:-translate-y-1 transition-all"
              >
                {a.avatar_url && (
                  <div className="relative">
                    <Image
                      src={a.avatar_url}
                      alt={a.nm_tampilan}
                      width={80}
                      height={80}
                      className="rounded-full ring-4 ring-white dark:ring-slate-900 shadow-md"
                    />
                    <BadgeCheck className="absolute -bottom-1 -right-1 w-6 h-6 text-myunila fill-white dark:fill-slate-900" />
                  </div>
                )}
                <h3 className="mt-3 font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-1">
                  {a.nm_tampilan}
                </h3>
                {a.tagline && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {a.tagline}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatNumber(a.jumlah_post)} posts</span>
                  <span aria-hidden>·</span>
                  <span>{formatNumber(a.jumlah_follower)} followers</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Authors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Penulis Aktif</h2>
          <Link href="/penulis" className="text-sm font-medium text-myunila hover:underline inline-flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topAuthors.map((a) => (
            <Link
              key={a.id_blog}
              href={getBlogUrl(a.subdomain)}
              className="group flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-myunila/10 hover:border-myunila/40 hover:-translate-y-1 transition-all"
            >
              {a.avatar_url && (
                <Image src={a.avatar_url} alt={a.nm_tampilan} width={64} height={64} className="rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" />
              )}
              <h3 className="mt-3 font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-1">
                {a.nm_tampilan}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.fakultas}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span>{formatNumber(a.jumlah_post)} posts</span>
                <span aria-hidden>·</span>
                <span>{formatNumber(a.jumlah_view)} views</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur border border-slate-200/50 dark:border-slate-700/50">
      <Icon className="w-5 h-5 text-myunila mb-1" />
      <div className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
