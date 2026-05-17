import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import { PostCard } from "@/shared/components/PostCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { getTagBySlug, getPostsByTag } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return buildMetadata({ title: `Tag ${slug}` });
  return buildMetadata({
    title: `#${tag.nm_tag}`,
    description: tag.deskripsi || `Artikel dengan tag ${tag.nm_tag} di Blog Unila.`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const [tag, postsResult] = await Promise.all([
    getTagBySlug(slug),
    getPostsByTag(slug, { limit: 24 }),
  ]);

  if (!tag) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <Hash className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">#{tag.nm_tag}</h1>
          {tag.deskripsi && (
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">{tag.deskripsi}</p>
          )}
          <p className="mt-1 text-sm text-slate-500">
            {formatNumber(postsResult.total)} artikel{tag.frekuensi > postsResult.total ? ` · ${formatNumber(tag.frekuensi)} kali ditandai` : ""}
          </p>
        </div>
      </header>

      {postsResult.items.length === 0 ? (
        <EmptyState
          title="Belum ada artikel"
          message={`Tidak ada artikel dengan tag #${tag.nm_tag} yang sudah dipublish.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsResult.items.map((p) => <PostCard key={p.id_post} post={p} />)}
        </div>
      )}
    </div>
  );
}
