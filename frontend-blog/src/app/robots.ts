// Apex robots.txt — Next.js metadata convention.
// URL: https://blog.unila.ac.id/robots.txt
// Strategy: allow public indexing of all blog content, disallow internal/draft routes,
// point crawlers to the sitemap index for efficient discovery.

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /tenant/ is the internal subdomain-router fallback path; tenant blogs
        // are canonical at https://<subdomain>.<apex>, so hide /tenant/ to
        // avoid duplicate-content penalties.
        disallow: ["/api/", "/_next/", "/admin/", "/draft/", "/tenant/"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `https://${apex}/sitemap.xml`,
    host: `https://${apex}`,
  };
}
