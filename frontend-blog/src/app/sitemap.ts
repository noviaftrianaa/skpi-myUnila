// Apex sitemap — Next.js metadata convention.
// URL: https://blog.unila.ac.id/sitemap.xml
// Fetches dari blog-service backend XML, parses, returns canonical Next.js sitemap format.
// Simpler: just stream XML directly via route handler with a workaround. Use route handler approach:
//   We don't use this metadata file — Next.js looks for sitemap.ts (no .xml) OR sitemap.xml/route.ts.
//   Since route handler dengan dot in dir name has issues, use the metadata format here.

import type { MetadataRoute } from "next";

const API_BASE = process.env.BLOG_API_INTERNAL || process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";

export const revalidate = 3600;

interface APIPostSummary {
  subdomain: string;
  slug: string;
  tgl_terbit?: string | null;
  created_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

  // Fetch latest 500 published posts cross-blog
  let posts: APIPostSummary[] = [];
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/posts?status=published&order=latest&limit=500`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      posts = json?.data?.items ?? [];
    }
  } catch {
    // silent fail — return minimal sitemap
  }

  const homepage: MetadataRoute.Sitemap = [
    { url: `https://${apex}/`, changeFrequency: "daily", priority: 1.0, lastModified: new Date() },
    { url: `https://${apex}/trending`, changeFrequency: "hourly", priority: 0.8 },
  ];
  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://${p.subdomain}.${apex}/posts/${p.slug}`,
    lastModified: p.tgl_terbit ? new Date(p.tgl_terbit) : new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...homepage, ...postUrls];
}
