"use client";

import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { FiDatabase, FiClock, FiFilter } from "react-icons/fi";

export interface PimpinanPageHeaderProps {
  title: string;
  description?: string;
  scopeActive?: boolean;
  dataSource?: string;
  lastSync?: string | null;
  /** Right-side action (e.g., refresh / export buttons) */
  rightSlot?: React.ReactNode;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export default function PimpinanPageHeader({
  title, description, scopeActive, dataSource, lastSync, rightSlot,
}: PimpinanPageHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {scopeActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
              <FiFilter className="w-3.5 h-3.5" /> Data sesuai peran aktif
            </span>
          )}
          {rightSlot}
        </div>
      </div>

      {/* Scope + Meta strip */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-0">
          <ScopeBadge />
        </div>
        {(dataSource || lastSync) && (
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
            {dataSource && (
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sumber:</span>
                <span>{dataSource}</span>
              </span>
            )}
            {dataSource && lastSync && (
              <span className="h-3 w-px bg-slate-300 dark:bg-gray-600" />
            )}
            {lastSync && (
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiClock className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sync:</span>
                <span className="font-mono">{formatDateTime(lastSync)}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
