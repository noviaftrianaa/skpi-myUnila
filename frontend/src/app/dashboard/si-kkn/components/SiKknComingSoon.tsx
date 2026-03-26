"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MaintenancePage from "@/shared/components/dashboard/MaintenancePage";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner } from "@heroui/react";

interface SiKknComingSoonProps {
  pageTitle: string;
  menuName: string;
  menuIcon?: string;
  message?: string;
}

export default function SiKknComingSoon({
  pageTitle,
  menuName,
  menuIcon = "heroicons:wrench-screwdriver",
  message,
}: SiKknComingSoonProps) {
  useRequireAuth();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle={pageTitle}
    >
      <MaintenancePage
        menuName={menuName}
        menuIcon={menuIcon}
        appName="SI KKN — Sistem Informasi Kuliah Kerja Nyata"
        message={message}
      />
    </DashboardLayoutWithDynamicMenu>
  );
}
