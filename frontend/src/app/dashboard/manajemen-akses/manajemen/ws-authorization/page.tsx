"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import WsAuthorizationManager from "@/shared/components/manakses/WsAuthorizationManager";
import { MdSecurity } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";

const APP_KEY = "manajemen-akses";

export default function WsAuthorizationPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="WS Authorization"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Otorisasi Web Service API
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola hak akses endpoint WS API Service untuk PJ Aplikasi eksternal yang ingin menggunakan API MyUnila
          </p>
        </div>
        <WsAuthorizationManager />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
