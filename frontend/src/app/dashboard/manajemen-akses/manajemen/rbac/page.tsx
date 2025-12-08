"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import RolePenggunaTable from "@/shared/components/manakses/RolePenggunaTable";
import {
  Spinner,
} from "@heroui/react";
import { MdSecurity } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";

export default function RBACPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout
        appName="Manajemen Akses"
        appIcon={<MdSecurity className="w-6 h-6 text-white" />}
        menuConfig={manajemenAksesMenuConfig}
        pageTitle="Role Base Access"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      menuConfig={manajemenAksesMenuConfig}
      pageTitle="Role Base Access"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Role Base Access Control
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola assignment peran ke pengguna di sistem Manajemen Akses
            </p>
          </div>
        </div>

        {/* Data Table */}
        <RolePenggunaTable />
      </div>
    </DashboardLayout>
  );
}
