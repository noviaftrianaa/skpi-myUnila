"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiFolder } from "react-icons/fi";
import { projectManagementMenuConfig } from "./config/menuConfig";

const APP_KEY = "project-management";

export default function ProjectManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Project Management"
      appIcon={<FiFolder className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={projectManagementMenuConfig}
    >
      {children}
    </DashboardLayoutWithDynamicMenu>
  );
}
