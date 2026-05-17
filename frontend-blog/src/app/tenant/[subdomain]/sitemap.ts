// Per-tenant sitemap. Next.js metadata convention.
// URL: https://{subdomain}.blog.unila.ac.id/sitemap.xml

import type { MetadataRoute } from "next";

const API_BASE = process.env.BLOG_API_INTERNAL || process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";

interface APIPostSummary {
  subdomain: string;
  slug: string;
  tgl_terbit?: string | null;
  created_at: string;
}

export const revalidate = 3600;

export default async function sitemap({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { subdomain } = await params;
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

  let posts: APIPostSummary[] = [];
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/posts?status=published&order=latest&limit=200&subdomain=${subdomain}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      posts = json?.data?.items ?? [];
    }
  } catch {}

  const home: MetadataRoute.Sitemap = [
    { url: `https://${subdomain}.${apex}/`, changeFrequency: "daily", priority: 1.0 },
  ];
  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://${subdomain}.${apex}/posts/${p.slug}`,
    lastModified: p.tgl_terbit ? new Date(p.tgl_terbit) : new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...home, ...postUrls];
}
