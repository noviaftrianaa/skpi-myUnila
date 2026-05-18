import type { Metadata } from "next";

export const SITE = {
  name: "Blog Unila",
  url: "https://blog.unila.ac.id",
  description: "Wadah publikasi civitas akademik Universitas Lampung — mahasiswa, dosen, staf. Artikel, opini, riset, tutorial.",
  defaultOgImage: "/og-default.png",
  twitter: "@unilalampung",
  publisher: {
    name: "Universitas Lampung",
    url: "https://www.unila.ac.id",
    logo: "https://www.unila.ac.id/wp-content/uploads/2020/08/logo-unila.png",
  },
};

// =============================================================================
// JSON-LD (Schema.org) builders. Returns plain object — caller wraps in
// <script type="application/ld+json"> tag via <JsonLd> component.
// =============================================================================

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "id-ID",
    publisher: {
      "@type": "Organization",
      name: SITE.publisher.name,
      url: SITE.publisher.url,
      logo: { "@type": "ImageObject", url: SITE.publisher.logo },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BlogJsonLdInput {
  subdomain: string;
  nm_blog: string;
  bio?: string | null;
  tagline?: string | null;
  nm_tampilan?: string | null;
  foto_url?: string | null;
  apex: string;
}

export function buildBlogJsonLd(b: BlogJsonLdInput): Record<string, unknown> {
  const siteUrl = `https://${b.subdomain}.${b.apex}`;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: b.nm_blog,
    description: b.tagline || b.bio || `Blog ${b.nm_blog} di ${SITE.name}`,
    url: siteUrl,
    inLanguage: "id-ID",
    author: {
      "@type": "Person",
      name: b.nm_tampilan || b.nm_blog,
      url: siteUrl,
      ...(b.foto_url ? { image: b.foto_url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE.publisher.name,
      url: SITE.publisher.url,
      logo: { "@type": "ImageObject", url: SITE.publisher.logo },
    },
  };
}

export interface BlogPostingJsonLdInput {
  subdomain: string;
  nm_blog: string;
  nm_tampilan?: string | null;
  foto_url?: string | null;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  konten_html?: string | null;
  tgl_terbit?: string | null;
  updated_at?: string | null;
  gambar_sampul?: string | null;
  kategori?: string | null;
  tags?: string[];
  apex: string;
  /** Additional contributors. Primary author always goes first; these append. */
  co_authors?: Array<{
    subdomain: string;
    nm_tampilan: string;
    avatar_url?: string | null;
  }>;
}

export function buildBlogPostingJsonLd(p: BlogPostingJsonLdInput): Record<string, unknown> {
  const siteUrl = `https://${p.subdomain}.${p.apex}`;
  const postUrl = `${siteUrl}/posts/${p.slug}`;
  const authorName = p.nm_tampilan || p.nm_blog;
  let wordCount: number | undefined;
  if (p.konten_html) {
    const text = p.konten_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    wordCount = text ? text.split(" ").length : 0;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.judul,
    description: p.ringkasan || undefined,
    image: p.gambar_sampul || undefined,
    datePublished: p.tgl_terbit || undefined,
    dateModified: p.updated_at || p.tgl_terbit || undefined,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    inLanguage: "id-ID",
    // Schema.org accepts `author` as a single Person OR an array of Persons.
    // When there are co-authors we emit an array so search engines surface
    // every contributor in rich results.
    author: p.co_authors && p.co_authors.length > 0
      ? [
          {
            "@type": "Person",
            name: authorName,
            url: siteUrl,
            ...(p.foto_url ? { image: p.foto_url } : {}),
          },
          ...p.co_authors.map((ca) => ({
            "@type": "Person",
            name: ca.nm_tampilan,
            url: `https://${ca.subdomain}.${p.apex}`,
            ...(ca.avatar_url ? { image: ca.avatar_url } : {}),
          })),
        ]
      : {
          "@type": "Person",
          name: authorName,
          url: siteUrl,
          ...(p.foto_url ? { image: p.foto_url } : {}),
        },
    publisher: {
      "@type": "Organization",
      name: SITE.publisher.name,
      url: SITE.publisher.url,
      logo: { "@type": "ImageObject", url: SITE.publisher.logo },
    },
    articleSection: p.kategori || undefined,
    keywords: p.tags && p.tags.length > 0 ? p.tags.join(", ") : undefined,
    wordCount,
    isAccessibleForFree: true,
  };
}

// Per-blog SEO config dari blog.meta_seo_json. Optional override semua default SITE.
export interface BlogSEO {
  title_template?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  twitter_handle?: string;
  twitter_card?: "summary" | "summary_large_image";
  robots?: string;
  // Search Console verification — owner copy-paste content value dari GSC
  // ("Other verification methods" → "HTML tag"), bukan full meta tag.
  gsc_verification?: string;
  // Bing webmaster tools (jarang dipakai tapi cheap to support).
  bing_verification?: string;
}

// Dynamic OG image — backend serves /api/v1/og as 1200×630 PNG with
// brand-coloured gradient + wrapped title + author byline. Used as the fallback
// og:image when a page has no real cover image.
export function buildOGImageURL(opts: {
  title?: string;
  subtitle?: string;
  author?: string;
  footer?: string;
}): string {
  // The browser hits the same hostname (kong / nginx rewrites /api → blog-service).
  // We use the apex base since it's what social crawlers will be able to reach
  // — they don't have access to the internal Docker hostname.
  const base = process.env.NEXT_PUBLIC_BLOG_API_PUBLIC || `${SITE.url}/api/v1/og`;
  const params = new URLSearchParams();
  if (opts.title) params.set("title", opts.title);
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  if (opts.author) params.set("author", opts.author);
  if (opts.footer) params.set("footer", opts.footer);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function buildMetadata(opts: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  blogSeo?: BlogSEO;        // override dari blog.meta_seo_json
  siteName?: string;        // override site name (per-tenant)
  rssUrl?: string;          // <link rel=alternate type=application/rss+xml>
  rssTitle?: string;        // title untuk RSS feed link
  languages?: Record<string, string>; // Phase BD — hreflang alternates ({"id": url, "en": url})
}): Metadata {
  const seo = opts.blogSeo || {};

  // Title: kalau ada title_template, replace {title}. Else default "{title} — {site}".
  let title: string;
  if (opts.title && seo.title_template) {
    title = seo.title_template.replace("{title}", opts.title);
  } else if (opts.title) {
    title = `${opts.title} — ${opts.siteName || SITE.name}`;
  } else {
    title = opts.siteName || SITE.name;
  }

  const description = opts.description || seo.description || SITE.description;
  const image = opts.image || seo.og_image || SITE.defaultOgImage;
  const url = opts.url || SITE.url;
  const twitterSite = seo.twitter_handle ? `@${seo.twitter_handle.replace(/^@/, "")}` : SITE.twitter;
  const twitterCard = seo.twitter_card || "summary_large_image";
  const keywords = seo.keywords ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined;

  // Parse robots: "noindex,nofollow" → split into index + follow booleans
  let robots: Metadata["robots"];
  if (seo.robots) {
    const flags = seo.robots.split(",").map((s) => s.trim().toLowerCase());
    robots = {
      index: !flags.includes("noindex"),
      follow: !flags.includes("nofollow"),
    };
  }

  const alternates: Metadata["alternates"] = { canonical: url };
  if (opts.rssUrl) {
    alternates.types = {
      "application/rss+xml": [{ url: opts.rssUrl, title: opts.rssTitle || `RSS — ${opts.siteName || SITE.name}` }],
    };
  }
  // Phase BD — hreflang antar versi bahasa (pair-linked posts)
  if (opts.languages && Object.keys(opts.languages).length > 0) {
    alternates.languages = opts.languages;
  }

  return {
    title,
    description,
    keywords,
    robots,
    metadataBase: new URL(SITE.url),
    alternates,
    openGraph: {
      title,
      description,
      url,
      siteName: opts.siteName || SITE.name,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title || SITE.name }],
      locale: "id_ID",
      type: opts.type || "website",
      ...(opts.type === "article" && {
        publishedTime: opts.publishedTime,
        authors: opts.authors,
        tags: opts.tags,
      }),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [image],
      site: twitterSite,
    },
    // Webmaster tools verification — owner setting di meta_seo_json. Next.js
    // render jadi <meta name="google-site-verification" content="..."> di <head>.
    ...((seo.gsc_verification || seo.bing_verification) && {
      verification: {
        ...(seo.gsc_verification && { google: seo.gsc_verification }),
        ...(seo.bing_verification && { other: { "msvalidate.01": seo.bing_verification } }),
      },
    }),
  };
}
