import { Flame } from "lucide-react";
import { PostCard } from "@/shared/components/PostCard";
import { getTrending } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata = buildMetadata({
  title: "Trending",
  description: "Artikel paling banyak dibaca di Blog Unila.",
});

export default async function TrendingPage() {
  const posts = await getTrending(50);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-500 flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">Trending</h1>
          <p className="text-slate-600 dark:text-slate-400">Artikel paling banyak dibaca minggu ini</p>
        </div>
      </header>

      <div className="space-y-1">
        {posts.map((p, idx) => (
          <div key={p.id_post} className="flex gap-4 sm:gap-6 items-start group py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="shrink-0 w-10 sm:w-14 text-center">
              <span className="text-3xl sm:text-4xl font-display font-bold text-slate-300 dark:text-slate-700 group-hover:text-myunila transition-colors">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <PostCard post={p} variant="list" className="!py-0 !border-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
