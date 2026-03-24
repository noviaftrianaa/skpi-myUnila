"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MaintenancePage from "@/shared/components/dashboard/MaintenancePage";
import { simBakMenuConfig } from "./config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner } from "@heroui/react";

export default function SimBakDashboardPage() {
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
      pageTitle="Dashboard SI MBAK"
    >
      <MaintenancePage
        menuName="Dashboard SI MBAK"
        menuIcon="heroicons:squares-2x2"
        appName="SI MBAK — Layanan Administrasi Kemahasiswaan"
        message="Dashboard akan menampilkan statistik layanan, pengajuan terbaru, SLA monitoring, dan trend chart. Fitur ini sedang dalam pengembangan."
        showBackButton={false}
      />
    </DashboardLayoutWithDynamicMenu>
  );
}
