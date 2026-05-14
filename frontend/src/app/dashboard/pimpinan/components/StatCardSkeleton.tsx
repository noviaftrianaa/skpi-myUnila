"use client";

/**
 * StatCardSkeleton — shimmer placeholder dengan ukuran identik StatCard
 * Pakai saat loading stats endpoint biar layout tidak jumping
 */
export default function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-pulse">
      <div className="absolute inset-0 opacity-40 animate-shimmer" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/40 dark:bg-white/10 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-2.5 w-24 rounded bg-white/40 dark:bg-white/10" />
          <div className="h-6 w-20 rounded bg-white/50 dark:bg-white/15" />
          <div className="h-2 w-28 rounded bg-white/30 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton row for chart cards */
export function ChartCardSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="rounded-2xl shadow-md bg-white dark:bg-gray-800 p-5 animate-pulse">
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
      <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-700 mb-5" />
      <div className="rounded-xl bg-slate-100 dark:bg-slate-700/60" style={{ height: `${height}px` }} />
    </div>
  );
}
