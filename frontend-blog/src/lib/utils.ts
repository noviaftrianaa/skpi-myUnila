import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  if (day < 7) return `${day} hari lalu`;
  if (day < 30) return `${Math.floor(day / 7)} minggu lalu`;
  if (month < 12) return `${month} bulan lalu`;
  return `${year} tahun lalu`;
}

export function readingTime(minutes: number): string {
  if (minutes < 1) return "< 1 menit baca";
  return `${minutes} menit baca`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Build URL ke per-user blog (subdomain).
 * - Prod (APEX_HOST = blog.unila.ac.id): https://{sub}.blog.unila.ac.id{path}
 * - Dev local (APEX_HOST = blog.local + hosts file): http://{sub}.blog.local:3002{path}
 * - Dev fallback (APEX_HOST=localhost atau no hosts): /{path}?tenant={sub}
 *
 * Detect dev mode kalau APEX_HOST contains "localhost" atau "blog.local".
 */
export function getBlogUrl(subdomain: string, path: string = "/"): string {
  const apexHost = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  const isDevLocalhost = apexHost.includes("localhost") || apexHost === "blog.local";

  // Dev mode: kalau hosts file gak di-setup (default), pakai query param fallback
  // (middleware sudah handle tenant via ?tenant= param)
  if (isDevLocalhost) {
    const cleanPath = path === "/" ? "" : path;
    const sep = cleanPath.includes("?") ? "&" : "?";
    return `${cleanPath || "/"}${sep}tenant=${subdomain}`;
  }

  // Production: subdomain real
  const protocol = "https";
  return `${protocol}://${subdomain}.${apexHost}${path}`;
}

export function getPostUrl(subdomain: string, slug: string): string {
  return getBlogUrl(subdomain, `/posts/${slug}`);
}
