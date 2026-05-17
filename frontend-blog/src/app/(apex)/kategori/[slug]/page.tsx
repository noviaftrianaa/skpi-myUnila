import { notFound } from "next/navigation";
import { PostCard } from "@/shared/components/PostCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { getKategoriBySlug, getPostsByKategori } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const kategori = await getKategoriBySlug(slug);
  if (!kategori) return buildMetadata({ title: "Kategori tidak ditemukan" });
  return buildMetadata({
    title: kategori.nm_kategori,
    description: kategori.deskripsi || `Artikel kategori ${kategori.nm_kategori} di Blog Unila.`,
  });
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;
  const [kategori, postsResult] = await Promise.all([
    getKategoriBySlug(slug),
    getPostsByKategori(slug, { limit: 24 }),
  ]);

  if (!kategori) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold"
          style={{ backgroundColor: `${kategori.warna || "#3B82F6"}20`, color: kategori.warna || "#3B82F6" }}
        >
          {kategori.nm_kategori.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">{kategori.nm_kategori}</h1>
          {kategori.deskripsi && <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">{kategori.deskripsi}</p>}
          <p className="mt-1 text-sm text-slate-500">{formatNumber(kategori.jumlah_post)} artikel</p>
        </div>
      </header>

      {postsResult.items.length === 0 ? (
        <EmptyState title="Belum ada artikel" message={`Belum ada artikel di kategori ${kategori.nm_kategori}. Jadilah yang pertama!`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsResult.items.map((p) => <PostCard key={p.id_post} post={p} />)}
        </div>
      )}
    </div>
  );
}
