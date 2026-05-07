"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import DashboardNavbar from "@/shared/components/dashboard/DashboardNavbar";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { FiArrowLeft, FiFolder } from "react-icons/fi";
import { ToastProvider } from "./components/ui";

// App key untuk Project Management (slug di man_akses.aplikasi)
const APP_KEY = "project-management";

export default function ProjectManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recheckKey, setRecheckKey] = useState(0);

  const {
    isLoading,
    hasAccess,
    requiresContextSelection,
    message,
  } = useRequireAppAccess({
    appKey: APP_KEY,
    showAccessDenied: true,
  });

  const handleRoleChange = useCallback(() => {
    setRecheckKey(prev => prev + 1);
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <AccessDenied
        message={message}
        requiresContextSelection={requiresContextSelection}
        appName="Project Management"
        onRoleChange={handleRoleChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Dashboard Navbar — same as other apps */}
      <DashboardNavbar />

      {/* Sub-nav: app identity */}
      <div className="sticky top-[72px] z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-11">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal</span>
            </Link>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <FiFolder className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                Project Management
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ToastProvider>
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}
