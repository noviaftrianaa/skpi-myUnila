"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 mt-2 rounded-lg" />
      </div>

      {/* Filter skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800">
            <CardBody className="p-4">
              <Skeleton className="h-4 w-20 rounded-lg mb-2" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Chart rows skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800">
            <CardBody className="p-6">
              <Skeleton className="h-5 w-48 rounded-lg mb-4" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800">
            <CardBody className="p-6">
              <Skeleton className="h-5 w-32 rounded-lg mb-4" />
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-red-800 dark:text-red-300 font-medium">
            Gagal Memuat Data
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {message}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 text-sm font-medium"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
