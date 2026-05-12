"use client";

import { FiUsers } from "react-icons/fi";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";

/**
 * Banner notifikasi server-side scope yang sedang aktif untuk user.
 *
 * Tampil HANYA jika role user punya scope (Dekan/Kaprodi/dst). Untuk Rektor /
 * Admin / Developer (universal) tidak tampil — mereka melihat data Unila penuh.
 *
 * Pakai komponen ini PERSIS di atas raw data table agar konsisten di semua page
 * Data Unila — user paham data yang ditampilkan sudah ter-filter sesuai peran.
 */
export default function ScopeBadge() {
  const scope = useRoleBasedScope();

  if (!scope.scopeName) return null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-900/20 px-4 py-2.5 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
        <FiUsers className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
      </span>
      <span className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">
        Scope: <strong>{scope.scopeName}</strong> — data otomatis ter-filter sesuai peran aktif Anda
      </span>
    </div>
  );
}
