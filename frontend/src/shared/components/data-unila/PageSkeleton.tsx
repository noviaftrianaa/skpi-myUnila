"use client";

import { ReactNode } from "react";

/**
 * Shimmer primitive — base block with animate-pulse and gradient shimmer overlay.
 * Uses globals.css .animate-shimmer (keyframes shimmer).
 */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/70 dark:bg-gray-700/40 rounded-md animate-pulse ${className}`}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

/**
 * Grid stat-card skeletons — drop-in replacement for stat loading spinner.
 */
export function StatCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Shimmer className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-2/3" />
              <Shimmer className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table rows skeleton — for DataTable loading state.
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Shimmer key={c} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart skeleton — configurable height.
 */
export function ChartSkeleton({ height = 300, title }: { height?: number; title?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      {title && <Shimmer className="h-4 w-1/3 mb-3" />}
      <div className="flex items-end gap-2" style={{ height }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const h = 30 + ((i * 13) % 70); // deterministic pseudo-random heights
          return (
            <Shimmer key={i} className="flex-1 rounded-t-md" />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Generic card-content skeleton.
 */
export function CardSkeleton({ lines = 4, children }: { lines?: number; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
      {children ?? Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} className="h-4" />
      ))}
    </div>
  );
}
