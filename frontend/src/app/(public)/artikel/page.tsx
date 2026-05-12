/**
 * Public Artikel list — accessible tanpa login, SEO-friendly.
 * Re-export dari /portal/artikel (sumber tunggal).
 * URL canonical: /artikel
 */
import type { Metadata } from "next";
import ArtikelListPage from "@/app/portal/artikel/page";

export const metadata: Metadata = {
  title: "Artikel — Universitas Lampung",
  description:
    "Opini, kajian, dan wawasan akademik dari civitas Universitas Lampung.",
  openGraph: {
    title: "Artikel Universitas Lampung",
    description:
      "Opini, kajian, dan wawasan akademik dari civitas Universitas Lampung.",
    type: "website",
    locale: "id_ID",
    siteName: "myUnila",
  },
};

export default function PublicArtikelListPage() {
  return <ArtikelListPage />;
}
