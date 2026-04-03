"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import PjAplikasiTable from "@/shared/components/manakses/PjAplikasiTable";
import { Card, CardBody } from "@heroui/react";
import { MdSecurity } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";

const APP_KEY = "manajemen-akses";

export default function PjAplikasiPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="PJ Aplikasi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Penanggung Jawab Aplikasi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola penanggung jawab (PIC) setiap aplikasi
          </p>
        </div>
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <PjAplikasiTable />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
