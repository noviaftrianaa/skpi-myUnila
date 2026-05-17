import Link from "next/link";
import type { Tag } from "@/types/blog";
import { cn } from "@/lib/utils";

interface Props {
  tag: Pick<Tag, "slug" | "nm_tag">;
  size?: "sm" | "md";
  className?: string;
}

export function TagChip({ tag, size = "sm", className }: Props) {
  return (
    <Link
      href={`/tag/${tag.slug}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-myunila/10 hover:text-myunila dark:hover:bg-myunila/20 transition-colors font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        className
      )}
    >
      #{tag.nm_tag}
    </Link>
  );
}
