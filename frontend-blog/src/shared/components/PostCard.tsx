import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, MessageCircle } from "lucide-react";
import type { Post } from "@/types/blog";
import { AuthorChip } from "./AuthorChip";
import { KategoriBadge } from "./KategoriBadge";
import { formatNumber, cn, getPostUrl } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  variant?: "default" | "compact" | "featured" | "list";
  showAuthor?: boolean;
  className?: string;
}

export function PostCard({ post, variant = "default", showAuthor = true, className }: PostCardProps) {
  const author = post.author;
  const postUrl = author ? getPostUrl(author.subdomain, post.slug) : `/posts/${post.slug}`;

  if (variant === "featured") {
    return (
      <article className={cn("group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300", className)}>
        <Link href={postUrl} className="block">
          {post.cover_url && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={post.cover_url}
                alt={post.judul}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {post.kategori && (
                <div className="absolute top-4 left-4">
                  <KategoriBadge kategori={post.kategori} size="md" asLink={false} className="!bg-white/95 !text-slate-900 backdrop-blur shadow-md" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl lg:text-3xl font-display font-bold leading-tight text-balance group-hover:underline">
                  {post.judul}
                </h2>
                {post.ringkasan && (
                  <p className="mt-2 text-white/90 text-sm lg:text-base line-clamp-2 text-pretty">
                    {post.ringkasan}
                  </p>
                )}
              </div>
            </div>
          )}
        </Link>
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          {author && showAuthor && (
            <AuthorChip author={author} date={post.tgl_terbit} readingMinutes={post.waktu_baca_menit} />
          )}
          <PostStats post={post} />
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className={cn("group flex gap-4 sm:gap-6 py-6 border-b border-slate-100 dark:border-slate-800 last:border-0", className)}>
        <div className="flex-1 min-w-0">
          {post.kategori && <KategoriBadge kategori={post.kategori} className="mb-2" />}
          <Link href={postUrl}>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 group-hover:text-myunila transition-colors leading-snug text-balance line-clamp-2">
              {post.judul}
            </h3>
          </Link>
          {post.ringkasan && (
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-2 text-pretty">
              {post.ringkasan}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {author && showAuthor && <AuthorChip author={author} date={post.tgl_terbit} readingMinutes={post.waktu_baca_menit} />}
            <PostStats post={post} />
          </div>
        </div>
        {post.cover_url && (
          <Link href={postUrl} className="shrink-0 hidden sm:block">
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image src={post.cover_url} alt={post.judul} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="160px" />
            </div>
          </Link>
        )}
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link href={postUrl}>
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila transition-colors leading-snug line-clamp-2">
            {post.judul}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {author && <span className="font-medium">{author.nm_tampilan}</span>}
          <span aria-hidden>·</span>
          <PostStats post={post} compact />
        </div>
      </article>
    );
  }

  // default
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300", className)}>
      {post.cover_url && (
        <Link href={postUrl} className="block">
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={post.cover_url}
              alt={post.judul}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        </Link>
      )}
      <div className="flex-1 flex flex-col p-5">
        {post.kategori && <KategoriBadge kategori={post.kategori} className="self-start mb-3" />}
        <Link href={postUrl} className="flex-1">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 group-hover:text-myunila transition-colors leading-snug text-balance line-clamp-2">
            {post.judul}
          </h3>
          {post.ringkasan && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 text-pretty">
              {post.ringkasan}
            </p>
          )}
        </Link>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {author && showAuthor && <AuthorChip author={author} date={post.tgl_terbit} readingMinutes={post.waktu_baca_menit} showRole={false} />}
        </div>
        <PostStats post={post} className="mt-3" />
      </div>
    </article>
  );
}

function PostStats({ post, compact = false, className }: { post: Post; compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400", className)}>
      <span className="inline-flex items-center gap-1">
        <Eye className="w-3.5 h-3.5" />
        <span>{formatNumber(post.jumlah_view)}</span>
      </span>
      {!compact && (
        <>
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{formatNumber(post.jumlah_like)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{formatNumber(post.jumlah_komentar)}</span>
          </span>
        </>
      )}
    </div>
  );
}
