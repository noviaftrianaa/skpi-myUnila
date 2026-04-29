"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import KontenDetail from "@/shared/components/manajemen-konten/KontenDetail";
import manajemenKontenService, { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";

export default function PengumumanDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Konten | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    manajemenKontenService
      .getKonten(id, true) // track_view=true
      .then((r) => {
        if (r.success) setData(r.data);
        else setError("Pengumuman tidak ditemukan");
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md text-center">
          <p className="text-gray-500">{error || "Pengumuman tidak ditemukan"}</p>
          <a href="/portal/announcements" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Kembali ke daftar pengumuman
          </a>
        </div>
      </div>
    );
  }

  return <KontenDetail data={data} backLabel="Daftar Pengumuman" backHref="/portal/announcements" />;
}
