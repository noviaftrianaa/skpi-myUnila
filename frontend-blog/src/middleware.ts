import { NextResponse, type NextRequest } from "next/server";

const APEX_HOST = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

// Standard Vercel multi-tenant pattern:
//   - Apex (blog.unila.ac.id, www): no rewrite, handled by app/(apex)/...
//   - Tenant ({sub}.blog.unila.ac.id/path): rewrite to /tenant/{sub}/path
//   - Localhost dev: ?tenant=demo-mhs query param fallback
//
// Direct URL /tenant/{sub} on apex domain → redirect ke proper subdomain.
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const url = req.nextUrl.clone();

  const isLocalhost = cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost === "::1";

  // 1. Dev mode: ?tenant= query param ALWAYS takes precedence (cek paling awal)
  //    Penting: must run BEFORE apex check, karena di dev host=localhost juga match APEX
  const tenantQuery = url.searchParams.get("tenant");
  if (tenantQuery && !url.pathname.startsWith("/tenant/")) {
    const originalPath = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/tenant/${tenantQuery}${originalPath}`;
    url.searchParams.delete("tenant");
    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-subdomain", tenantQuery);
    return res;
  }

  // 2. Apex host (real prod domain atau local "blog.local"/"localhost")
  if (cleanHost === APEX_HOST || cleanHost === `www.${APEX_HOST}` || isLocalhost) {
    // Block direct /tenant/* access on apex (prevent SEO duplicates) — only in prod with real APEX
    if (!isLocalhost && url.pathname.startsWith("/tenant/")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const sub = segments[1];
      const rest = "/" + segments.slice(2).join("/");
      return NextResponse.redirect(
        new URL(`${url.protocol}//${sub}.${APEX_HOST}${port}${rest}${url.search}`)
      );
    }
    return NextResponse.next();
  }

  // 3. Tenant subdomain (production: {sub}.blog.unila.ac.id)
  if (cleanHost.endsWith(`.${APEX_HOST}`)) {
    const subdomain = cleanHost.replace(`.${APEX_HOST}`, "");
    if (subdomain && subdomain !== "www") {
      url.pathname = `/tenant/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      const res = NextResponse.rewrite(url);
      res.headers.set("x-tenant-subdomain", subdomain);
      return res;
    }
  }

  // 4. Default
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
