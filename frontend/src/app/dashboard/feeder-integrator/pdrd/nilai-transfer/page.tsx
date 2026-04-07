"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";
import { Card, CardBody } from "@heroui/react";
import { RiGraduationCapFill } from "react-icons/ri";
import { FiDatabase, FiUsers } from "react-icons/fi";

const APP_KEY = "feeder-integrator";

export default function NilaiTransferPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Feeder Integrator"
      appIcon={<FiDatabase className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={feederIntegratorMenuConfig}
      pageTitle="Nilai Transfer"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardBody className="p-8 text-center">
          <div className="mb-4">
            <FiUsers className="w-24 h-24 text-blue-500 mx-auto opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Nilai Transfer sedang dalam tahap pengembangan.
          </p>
        </CardBody>
      </Card>
    </DashboardLayoutWithDynamicMenu>
  );
}
