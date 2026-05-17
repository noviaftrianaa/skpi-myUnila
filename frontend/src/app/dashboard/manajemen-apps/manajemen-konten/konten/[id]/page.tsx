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
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/dashboard/manajemen-konten" className="hover:text-blue-600">
              Manajemen Konten
            </Link>
            <span>/</span>
            <Link href="/dashboard/manajemen-konten/konten" className="hover:text-blue-600">
              Konten
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Edit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">
            {data?.judul || (loading ? "Memuat..." : "Edit Konten")}
          </h1>
          {data && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
              <span className={`px-2 py-0.5 rounded-full font-semibold ${
                data.status === "published" ? "bg-emerald-100 text-emerald-700"
                : data.status === "draft" ? "bg-gray-100 text-gray-700"
                : "bg-rose-100 text-rose-700"
              }`}>
                {data.status}
              </span>
              <span>·</span>
              <span className="capitalize">{data.tipe}</span>
              {data.view_count > 0 && (
                <>
                  <span>·</span>
                  <span>{data.view_count.toLocaleString("id-ID")} views</span>
                </>
              )}
            </div>
          )}
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
