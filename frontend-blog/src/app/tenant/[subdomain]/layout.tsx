import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySubdomain } from "@/lib/api";
import { TenantHeader } from "@/shared/components/TenantHeader";
import { TenantFooter } from "@/shared/components/TenantFooter";

interface Props {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

// Tenant-level metadata: hanya inject RSS alternate link (per-blog feed URL).
// Title/description di-handle per-page (post detail, profile, dst).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const apex = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";
  const blogName = (await getBlogBySubdomain(subdomain))?.nm_blog || subdomain;
  return {
    alternates: {
      types: {
        "application/rss+xml": [
          { url: `https://${subdomain}.${apex}/rss`, title: `RSS — ${blogName}` },
        ],
      },
    },
  };
}

export default async function TenantLayout({ children, params }: Props) {
  const { subdomain } = await params;
  const blog = await getBlogBySubdomain(subdomain);
  if (!blog) notFound();

  // Theme accent color via inline CSS variables (lightweight per-tenant theme)
  const theme = blog.theme_config_json || {};
  const accent = theme.warna_primer || "#0B5EA8";
  const accentDark = theme.warna_sekunder || "#073864";

  const basePath = `/tenant/${subdomain}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ["--tenant-accent" as string]: accent, ["--tenant-accent-dark" as string]: accentDark }}
    >
      <TenantHeader blog={blog} basePath={basePath} />
      <main className="flex-1">{children}</main>
      <TenantFooter blog={blog} basePath={basePath} />
    </div>
  );
}
