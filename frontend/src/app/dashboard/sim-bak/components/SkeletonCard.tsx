'use client';

import React from 'react';

/** Skeleton loading card — gunakan sebagai placeholder saat data loading */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white dark:bg-gray-800 shadow-md p-5 ${className}`}>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
    </div>
  );
}

/** Skeleton stat cards row */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton table rows */
export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={`h-3 bg-gray-100 dark:bg-gray-700/50 rounded flex-1 ${c === 0 ? 'max-w-[80px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
