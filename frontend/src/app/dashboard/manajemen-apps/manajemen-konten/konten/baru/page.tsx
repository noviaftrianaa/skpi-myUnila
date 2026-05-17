"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { manajemenKontenMenuConfig } from "../../config/menuConfig";
import KontenForm from "@/shared/components/manajemen-konten/KontenForm";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import { KontenTipe } from "@/lib/services/manajemen-konten/manajemenKontenService";

const APP_KEY = "manajemen-konten";

export default function KontenBaruPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Memuat...</div>}>
      <KontenBaruContent />
    </Suspense>
  );
}

function KontenBaruContent() {
  useRequireAuth();
  const sp = useSearchParams();
  const defaultTipe = (sp.get("tipe") as KontenTipe) || "pengumuman";

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiFileText className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle="Tulis Konten Baru"
    >
      <Toaster position="top-right" />
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/dashboard/manajemen-apps/manajemen-konten" className="hover:text-blue-600">
              Manajemen Konten
            </Link>
            <span>/</span>
            <Link href="/dashboard/manajemen-apps/manajemen-konten/konten" className="hover:text-blue-600">
              Konten
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Baru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tulis Konten Baru</h1>
          <p className="text-sm text-gray-600 mt-1">
            Default tipe: <span className="font-semibold text-gray-800 capitalize">{defaultTipe}</span> — bisa diubah di sidebar kanan.
          </p>
        </div>

        <KontenForm defaultTipe={defaultTipe} />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
