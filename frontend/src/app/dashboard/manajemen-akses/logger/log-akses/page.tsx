"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, Button } from "@heroui/react";
import { FiActivity, FiArrowLeft } from "react-icons/fi";
import { MdSecurity, MdConstruction } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import Link from "next/link";

const APP_KEY = "manajemen-akses";

export default function LogAksesPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Log Akses"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full border-none shadow-xl">
          <CardBody className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4">
                <MdConstruction className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Fitur Log Akses sedang dalam pengembangan
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiActivity className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Audit trail semua akses
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiActivity className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Resource access logging
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiActivity className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Permission denied tracking
                </span>
              </div>
            </div>

            <Button
              as={Link}
              href="/dashboard/manajemen-akses"
              color="primary"
              variant="flat"
              startContent={<FiArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
