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
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manajemen-konten/konten"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tulis Konten Baru</h1>
        </div>

        <KontenForm defaultTipe={defaultTipe} />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
