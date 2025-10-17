"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import BottomNavigation from "./BottomNavigation";
import type { MenuItem } from "@/lib/types/dashboard.types";

interface DashboardLayoutProps {
  children: ReactNode;
  appName: string;
  appIcon?: React.ReactNode;
  menuConfig: MenuItem[]; // Pass menu config from each app
  pageTitle?: string;
  showBottomNav?: boolean; // Optional: show bottom nav on mobile
}

export default function DashboardLayout({
  children,
  appName,
  appIcon,
  menuConfig,
  pageTitle,
  showBottomNav = false, // Default false for dashboard
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar
        appName={appName}
        appIcon={appIcon}
        menuConfig={menuConfig}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {/* Decorative gradient overlay for smooth transition */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>

          {children}
        </main>
      </div>
    </div>
  );
}
