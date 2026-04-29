"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import KontenDetail from "@/shared/components/manajemen-konten/KontenDetail";
import KontenDetailSkeleton from "@/shared/components/manajemen-konten/KontenDetailSkeleton";
import manajemenKontenService, { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";

export default function BeritaDetailPage() {
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
        else setError("Berita tidak ditemukan");
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <KontenDetailSkeleton backLabel="Daftar Berita" backHref="/portal/berita" />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center px-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <FiAlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Berita tidak ditemukan</h2>
          <p className="text-sm text-gray-500 mb-5">
            {error || "Halaman yang Anda cari tidak tersedia atau telah dihapus."}
          </p>
          <Link
            href="/portal/berita"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  return <KontenDetail data={data} backLabel="Daftar Berita" backHref="/portal/berita" />;
}
