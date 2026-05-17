// Per-blog RSS proxy — fetch dari backend by subdomain.
// Public URL: https://{subdomain}.blog.unila.ac.id/rss

import { NextResponse } from "next/server";

const API_BASE = process.env.BLOG_API_INTERNAL || process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";

export const revalidate = 600;

export async function GET(_req: Request, { params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/v1/blogs/by-subdomain/${subdomain}/rss`, {
      next: { revalidate: 600 },
    });
    if (res.status === 404) {
      return new NextResponse("Blog not found", { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 });
    }
    const xml = await res.text();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
