import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Author } from "@/types/blog";
import { cn, formatRelativeTime, getBlogUrl, readingTime } from "@/lib/utils";

interface Props {
  author: Author;
  date?: string | null;
  readingMinutes?: number;
  size?: "sm" | "md";
  showRole?: boolean;
  className?: string;
  apexLink?: boolean; // true → cross-blog link (apex), false → relative dalam tenant context
}

export function AuthorChip({ author, date, readingMinutes, size = "sm", showRole = true, className, apexLink = true }: Props) {
  const blogUrl = apexLink ? getBlogUrl(author.subdomain) : "/";

  return (
    <div className={cn("flex items-center gap-2.5 text-slate-600 dark:text-slate-400", className)}>
      <Link href={blogUrl} className="shrink-0 inline-flex items-center gap-2 hover:text-myunila transition-colors">
        {author.avatar_url && (
          <Image
            src={author.avatar_url}
            alt={author.nm_tampilan}
            width={size === "md" ? 36 : 28}
            height={size === "md" ? 36 : 28}
            className={cn("rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm", size === "md" && "w-9 h-9", size === "sm" && "w-7 h-7")}
          />
        )}
        <span className={cn("font-medium text-slate-900 dark:text-slate-100 inline-flex items-center gap-1", size === "md" && "text-base", size === "sm" && "text-sm")}>
          {author.nm_tampilan}
          {author.a_terverifikasi && <BadgeCheck className="w-3.5 h-3.5 text-myunila fill-myunila/20" aria-label="Verified" />}
        </span>
      </Link>
      {(date || readingMinutes !== undefined) && (
        <div className={cn("flex items-center gap-1.5", size === "md" ? "text-sm" : "text-xs")}>
          {date && <span aria-hidden>·</span>}
          {date && <time dateTime={date}>{formatRelativeTime(date)}</time>}
          {readingMinutes !== undefined && (
            <>
              <span aria-hidden>·</span>
              <span>{readingTime(readingMinutes)}</span>
            </>
          )}
        </div>
      )}
      {showRole && author.fakultas && (
        <span className={cn("hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium")}>
          {author.fakultas}
        </span>
      )}
    </div>
  );
}
