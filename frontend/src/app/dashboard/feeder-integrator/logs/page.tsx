"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import { Card, CardBody } from "@heroui/react";
import { MdSync } from "react-icons/md";
import { FiFileText } from "react-icons/fi";

export default function LogsPage() {
  useRequireAuth();

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSync className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Logs"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardBody className="p-8 text-center">
          <div className="mb-4">
            <FiFileText className="w-24 h-24 text-blue-500 mx-auto opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Logs Sinkronisasi sedang dalam tahap pengembangan.
          </p>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
