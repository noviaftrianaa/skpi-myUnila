/**
 * Public Berita list — accessible tanpa login.
 * Re-export dari /portal/berita supaya single source of truth.
 * URL canonical: /berita (SEO + shareable).
 */
import type { Metadata } from "next";
import BeritaListPage from "@/app/portal/berita/page";

export const metadata: Metadata = {
  title: "Berita & Artikel — Universitas Lampung",
  description:
    "Liputan kegiatan, prestasi, opini, dan wawasan dari Universitas Lampung.",
  openGraph: {
    title: "Berita & Artikel Universitas Lampung",
    description:
      "Liputan kegiatan, prestasi, opini, dan wawasan dari Universitas Lampung.",
    type: "website",
    locale: "id_ID",
    siteName: "myUnila",
  },
};

export default function PublicBeritaListPage() {
  return <BeritaListPage />;
}
