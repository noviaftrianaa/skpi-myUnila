"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MaintenancePage from "@/shared/components/dashboard/MaintenancePage";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner } from "@heroui/react";

interface SimBakComingSoonProps {
  pageTitle: string;
  menuName: string;
  menuIcon?: string;
  message?: string;
}

export default function SimBakComingSoon({
  pageTitle,
  menuName,
  menuIcon = "heroicons:wrench-screwdriver",
  message,
}: SimBakComingSoonProps) {
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
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle={pageTitle}
    >
      <MaintenancePage
        menuName={menuName}
        menuIcon={menuIcon}
        appName="SI MBAK — Layanan Administrasi Kemahasiswaan"
        message={message}
      />
    </DashboardLayoutWithDynamicMenu>
  );
}
