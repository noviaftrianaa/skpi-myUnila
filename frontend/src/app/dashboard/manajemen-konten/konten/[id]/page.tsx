"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { manajemenKontenMenuConfig } from "../../config/menuConfig";
import KontenForm from "@/shared/components/manajemen-konten/KontenForm";
import manajemenKontenService, { Konten } from "@/lib/services/manajemen-konten/manajemenKontenService";
import { Toaster, toast } from "react-hot-toast";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

const APP_KEY = "manajemen-konten";

export default function KontenEditPage() {
  useRequireAuth();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Konten | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    manajemenKontenService
      .getKonten(id)
      .then((r) => {
        if (r.success) setData(r.data);
      })
      .catch((err: any) => {
        toast.error("Gagal memuat: " + (err?.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiFileText className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle={data?.judul || "Edit Konten"}
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manajemen-konten/konten"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {data?.judul || (loading ? "Memuat..." : "Edit Konten")}
          </h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-500">Memuat data konten...</p>
          </div>
        ) : data ? (
          <KontenForm initialData={data} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-500">Konten tidak ditemukan</p>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
