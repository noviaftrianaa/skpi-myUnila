"use client";

import { FiUsers, FiGlobe } from "react-icons/fi";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";

/**
 * Banner notifikasi server-side scope yang sedang aktif untuk user.
 *
 * Selalu tampil — clarifies cakupan data yang user lihat:
 * - Role scope (Dekan/Kaprodi/Kajur/dll) → "Fakultas X" / "Jurusan Y" / "Prodi Z"
 * - Role universal (Rektor/Admin/Developer) → "Universitas Lampung — data seluruh universitas"
 */
export default function ScopeBadge() {
  const scope = useRoleBasedScope();

  const isUniversal = !scope.scopeName;
  const label = isUniversal ? "Universitas Lampung" : scope.scopeName;
  const desc = isUniversal
    ? "data seluruh universitas (tanpa filter unit)"
    : "data otomatis ter-filter sesuai peran aktif Anda";
  const Icon = isUniversal ? FiGlobe : FiUsers;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 px-4 py-2.5 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800">
        <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
      </span>
      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        Scope: <strong className="text-slate-900 dark:text-white">{label}</strong> — {desc}
      </span>
    </div>
  );
}
