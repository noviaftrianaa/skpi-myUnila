"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";
import { MdBusiness } from "react-icons/md";
import { pimpinanMenuConfig } from "./config/menuConfig";

// App key for Manajemen Akses myUnila
const APP_KEY = "dashboard-pimpinan";

export default function ManajemenAksesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force re-check counter
  const [recheckKey, setRecheckKey] = useState(0);

  const { isLoading, hasAccess, requiresContextSelection, message } =
    useRequireAppAccess({
      appKey: APP_KEY,
      showAccessDenied: true,
    });

  // Callback when role is changed - forces re-check by updating state
  const handleRoleChange = useCallback(() => {
    setRecheckKey((prev) => prev + 1);
    // Also reload the page to fully re-initialize
    window.location.reload();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no access
  if (hasAccess === false) {
    return (
      <AccessDenied
        message={message}
        requiresContextSelection={requiresContextSelection}
        appName="Manajemen Akses myUnila"
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Render children if access granted
  return (
    <>
      {" "}
      <DashboardLayoutWithDynamicMenu
        appName="Dashboard Pimpinan"
        appKey="dashboard-pimpinan"
        appIcon={<MdBusiness className="w-6 h-6 text-white" />}
        fallbackMenus={pimpinanMenuConfig}
        pageTitle="Dashboard"
      >
        {children}
      </DashboardLayoutWithDynamicMenu>
    </>
  );
}
