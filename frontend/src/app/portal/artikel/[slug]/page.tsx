"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import KontenDetail from "@/shared/components/manajemen-konten/KontenDetail";
import KontenDetailSkeleton from "@/shared/components/manajemen-konten/KontenDetailSkeleton";
import manajemenKontenService, { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";

export default function ArtikelDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<Konten | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const fetcher = isUUID
      ? manajemenKontenService.getKonten(slug, true)
      : manajemenKontenService.getKontenBySlug(slug, true);
    fetcher
      .then((r) => {
        if (r.success) setData(r.data);
        else setError("Artikel tidak ditemukan");
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <KontenDetailSkeleton backLabel="Daftar Artikel" backHref="/portal/artikel" />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/40 to-indigo-50/30 flex items-center justify-center px-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <FiAlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Artikel tidak ditemukan</h2>
          <p className="text-sm text-gray-500 mb-5">
            {error || "Halaman yang Anda cari tidak tersedia atau telah dihapus."}
          </p>
          <Link
            href="/portal/artikel"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Daftar Artikel
          </Link>
        </div>
      </div>
    );
  }

  return <KontenDetail data={data} backLabel="Daftar Artikel" backHref="/portal/artikel" />;
}
