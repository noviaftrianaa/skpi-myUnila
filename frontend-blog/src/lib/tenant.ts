// Helpers untuk extract subdomain dari hostname.
// Apex = blog.unila.ac.id (atau env override). Tenant = {sub}.blog.unila.ac.id.

const APEX_HOST = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

export function getApexHost(): string {
  return APEX_HOST;
}

export function isApexHost(host: string): boolean {
  const cleanHost = host.split(":")[0].toLowerCase();
  return cleanHost === APEX_HOST || cleanHost === `www.${APEX_HOST}`;
}

export function extractSubdomain(host: string): string | null {
  const cleanHost = host.split(":")[0].toLowerCase();
  if (isApexHost(cleanHost)) return null;
  if (!cleanHost.endsWith(`.${APEX_HOST}`)) return null;
  const sub = cleanHost.replace(`.${APEX_HOST}`, "");
  if (!sub || sub === "www") return null;
  return sub;
}

export type TenantInfo = {
  subdomain: string;
  basename: string;       // NIM atau base name
  suffix: "-mhs" | "-staf" | "-dosen" | "-alumni" | null;
};

export function parseTenantSubdomain(subdomain: string): TenantInfo {
  const suffixes = ["-mhs", "-staf", "-dosen", "-alumni"] as const;
  for (const sfx of suffixes) {
    if (subdomain.endsWith(sfx)) {
      return { subdomain, basename: subdomain.slice(0, -sfx.length), suffix: sfx };
    }
  }
  return { subdomain, basename: subdomain, suffix: null };
}
