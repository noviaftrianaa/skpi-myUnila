"use client";

/**
 * ScopeGuard — wrapper layout untuk Dashboard Pimpinan & Data Unila.
 *
 * Goals:
 *   1. Tampilkan error full-screen jika user belum punya homebase mapping
 *      (level_organisasi null / id_organisasi null untuk peran scope-required).
 *   2. Display scope badge prominent: "Anda lihat data: Fakultas X" atau
 *      "Universitas Lampung" untuk Rektor.
 *   3. Hint visual: data otomatis ter-scope sesuai homebase peran aktif.
 *
 * Logic:
 *   - Rektor/Universitas (level<=3 atau peran universal) → no scope, free
 *   - Dekan (level=4) → scoped ke fakultas, filter fakultas di-hide
 *   - Kaprodi (level=5) → scoped ke prodi, filter fakultas+prodi di-hide
 *   - User tidak punya peran scope-aware → tampilkan error mapping
 */
import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useUserContext } from "@/contexts/UserContextContext";

const NON_SCOPE_ROLE_KEYWORDS = ["administrator", "developer", "helpdesk", "service api"];

export default function ScopeGuard({ children }: { children: React.ReactNode }) {
  const { activeContext, isLoadingContext } = useUserContext();

  if (isLoadingContext) return null; // parent layout handle loading state

  // Tidak ada active context sama sekali — biar parent (require auth) handle
  if (!activeContext) return <>{children}</>;

  const level = Number(activeContext.level_organisasi);
  const idOrg = activeContext.id_organisasi;
  const namaPeran = (activeContext.nm_peran || "").toLowerCase();

  // Peran admin/universal — tidak perlu homebase mapping
  const isUniversal =
    !level || level <= 3 || NON_SCOPE_ROLE_KEYWORDS.some((k) => namaPeran.includes(k));

  // Peran scope-required tapi tidak punya unit → error mapping
  if (!isUniversal && (!idOrg || isNaN(level))) {
    return <HomebaseNotMappedError peran={activeContext.nm_peran || "User"} />;
  }

  return <>{children}</>;
}

function HomebaseNotMappedError({ peran }: { peran: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8 text-center dark:border-amber-800/40 dark:bg-amber-900/10">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <Icon icon="heroicons:exclamation-triangle" className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
          Homebase Belum Dimapping
        </h2>
        <p className="text-sm text-gray-700 dark:text-slate-300 mb-1">
          Peran aktif Anda <strong>{peran}</strong> belum terhubung ke unit organisasi
          (fakultas/prodi).
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          Sistem tidak dapat menentukan scope data tanpa mapping unit. Hubungi UPT TIK
          atau ajukan akses ulang via SSAR.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
          >
            <Icon icon="heroicons:arrow-left" className="w-3.5 h-3.5" />
            Kembali ke Portal
          </Link>
          <Link
            href="/pengajuan-akses"
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Icon icon="heroicons:paper-airplane" className="w-3.5 h-3.5" />
            Ajukan Akses Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
