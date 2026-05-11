"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";
import { MdScience } from "react-icons/md";
import { pimpinanDevMenuConfig } from "./config/menuConfig";

// App key — TERPISAH dari Dashboard Pimpinan utama:
// app baru `dashboard-pimpinan-dev` di portal myUnila utk lab eksperimen magang.
const APP_KEY = "dashboard-pimpinan-dev";

export default function PimpinanDevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recheckKey, setRecheckKey] = useState(0);

  const { isLoading, hasAccess, requiresContextSelection, message } =
    useRequireAppAccess({
      appKey: APP_KEY,
      showAccessDenied: true,
    });

  const handleRoleChange = useCallback(() => {
    setRecheckKey((prev) => prev + 1);
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Spinner size="lg" color="warning" />
          <p className="mt-4 text-gray-600">Memeriksa akses lab eksperimen...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <AccessDenied
        message={message}
        requiresContextSelection={requiresContextSelection}
        appName="Dashboard Pimpinan (Dev)"
        onRoleChange={handleRoleChange}
      />
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan (Dev)"
      appKey={APP_KEY}
      appIcon={<MdScience className="w-6 h-6 text-white" />}
      fallbackMenus={pimpinanDevMenuConfig}
      pageTitle="Dashboard Pimpinan (Eksperimen)"
    >
      {/* Banner label "Eksperimen" — supaya user sadar ini lab, bukan production */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/50 px-4 py-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <MdScience className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium">
          🧪 LAB EKSPERIMEN — Versi pengembangan oleh mahasiswa magang. Untuk versi production gunakan{" "}
          <a href="/dashboard/pimpinan" className="underline font-semibold hover:text-amber-900">
            Dashboard Pimpinan
          </a>
        </span>
      </div>
      {children}
    </DashboardLayoutWithDynamicMenu>
  );
}
