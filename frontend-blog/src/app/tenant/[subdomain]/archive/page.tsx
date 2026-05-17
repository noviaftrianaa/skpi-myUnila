import { notFound } from "next/navigation";
import { getBlogBySubdomain, getBlogPosts } from "@/lib/api";
import { PostCard } from "@/shared/components/PostCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) return buildMetadata({ title: "Arsip" });
  return buildMetadata({ title: `Arsip — ${blog.nm_blog}` });
}

export default async function TenantArchivePage({ params }: PageProps) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) notFound();

  const postsResult = await getBlogPosts(subdomain, { limit: 100 });

  // Group by year-month
  const groups = new Map<string, typeof postsResult.items>();
  postsResult.items.forEach((p) => {
    const ym = (p.tgl_terbit || "").slice(0, 7) || "Lainnya";
    if (!groups.has(ym)) groups.set(ym, []);
    groups.get(ym)!.push(p);
  });

  const sortedKeys = Array.from(groups.keys()).sort().reverse();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">Arsip Artikel</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">{postsResult.total} artikel oleh {blog.nm_tampilan}</p>

      {postsResult.items.length === 0 ? (
        <EmptyState title="Belum ada arsip" />
      ) : (
        <div className="space-y-12">
          {sortedKeys.map((ym) => {
            const [year, month] = ym.split("-");
            const monthName = month ? new Date(2000, Number(month) - 1, 1).toLocaleDateString("id-ID", { month: "long" }) : "";
            return (
              <section key={ym}>
                <h2 className="text-xl font-display font-bold mb-4 sticky top-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur py-2">
                  {monthName} {year}
                </h2>
                <div className="space-y-4">
                  {groups.get(ym)!.map((p) => (
                    <PostCard key={p.id_post} post={p} variant="list" showAuthor={false} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
