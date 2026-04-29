"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function KontenDetailSkeleton({
  backLabel,
  backHref,
}: {
  backLabel: string;
  backHref: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
            <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mb-4" />

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-48 sm:h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          <div className="p-5 sm:p-8 md:p-10">
            <div className="flex gap-1.5 mb-4">
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="h-8 sm:h-10 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 sm:h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-5" />

            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
