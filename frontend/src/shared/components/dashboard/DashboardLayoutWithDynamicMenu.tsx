"use client";

/**
 * DashboardLayoutWithDynamicMenu
 *
 * Wrapper component yang menggunakan useAppMenus hook untuk load menu dari RBAC API.
 * Menu akan di-load secara dynamic berdasarkan:
 * 1. app_key (slug aplikasi)
 * 2. Role user yang aktif
 * 3. Permission di menu_role table
 *
 * Support for maintenance mode:
 * - When a_tampil = 0, shows MaintenancePage instead of content
 */

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MaintenancePage from "./MaintenancePage";
import { useAppMenus } from "@/lib/hooks/useAppMenus";
import { useMenuMaintenance } from "@/lib/hooks/useMenuMaintenance";
import type { MenuItem } from "@/lib/types/dashboardTypes";

interface DashboardLayoutWithDynamicMenuProps {
  children: ReactNode;
  appName: string;
  appKey: string; // Required: app_slug untuk fetch menu dari RBAC API
  appIcon?: React.ReactNode;
  fallbackMenus?: MenuItem[]; // Optional: fallback jika API gagal
  pageTitle?: string;
}

export default function DashboardLayoutWithDynamicMenu({
  children,
  appName,
  appKey,
  appIcon,
  fallbackMenus = [],
  pageTitle,
}: DashboardLayoutWithDynamicMenuProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch menus from RBAC API
  const { menus, isLoading, error, isSuperRole } = useAppMenus({
    appKey,
    fallbackMenus,
  });

  // Check if current route is under maintenance
  const { isMaintenance, menuName, menuIcon } = useMenuMaintenance(menus);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Sidebar with dynamic menus */}
      <Sidebar
        appName={appName}
        appIcon={appIcon}
        menuConfig={menus}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLoading={isLoading}
        skipRoleFilter={true} // Menu sudah di-filter oleh backend RBAC
      />

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Navbar */}
        <DashboardNavbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content with smooth transition */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Decorative gradient overlay for smooth transition */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>

          <div className="max-w-full mx-auto">
            {isMaintenance ? (
              <MaintenancePage
                menuName={menuName || "Fitur"}
                menuIcon={menuIcon || "heroicons:wrench-screwdriver"}
                appName={appName}
              />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
