import Link from "next/link";
import type { Kategori } from "@/types/blog";
import { cn } from "@/lib/utils";

interface Props {
  kategori: Pick<Kategori, "slug" | "nm_kategori" | "warna">;
  size?: "sm" | "md";
  className?: string;
  asLink?: boolean;
}

export function KategoriBadge({ kategori, size = "sm", className, asLink = true }: Props) {
  const styles = {
    backgroundColor: kategori.warna ? `${kategori.warna}15` : "rgb(241 245 249)",
    color: kategori.warna || "rgb(71 85 105)",
    borderColor: kategori.warna ? `${kategori.warna}40` : "rgb(226 232 240)",
  };

  const content = (
    <span
      style={styles}
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border transition-transform",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        asLink && "hover:scale-105",
        className
      )}
    >
      {kategori.nm_kategori}
    </span>
  );

  if (!asLink) return content;
  return <Link href={`/kategori/${kategori.slug}`}>{content}</Link>;
}
