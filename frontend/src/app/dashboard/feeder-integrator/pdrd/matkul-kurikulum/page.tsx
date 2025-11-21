"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody } from "@heroui/react";
import { FiBook, FiClock } from "react-icons/fi";
import { MdConstruction } from "react-icons/md";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";

export default function MatkulKurikulumPage() {
  useRequireAuth();
  const { user } = useAuth();

  return (
    <DashboardLayout
      menuConfig={feederIntegratorMenuConfig}
      userRole={user?.role || ""}
      breadcrumbs={[
        { label: "Feeder Integrator", href: "/dashboard/feeder-integrator" },
        { label: "Data PDRD", href: "#" },
        { label: "Matkul Kurikulum", href: "/dashboard/feeder-integrator/pdrd/matkul-kurikulum" },
      ]}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiBook className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Matkul Kurikulum
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sinkronisasi data mata kuliah kurikulum ke PDDIKTI
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <MdConstruction className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                Fitur Dalam Pengembangan
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Halaman Matkul Kurikulum sedang dalam proses pengembangan.
                Fitur ini akan segera tersedia untuk membantu Anda mengelola data mata kuliah dalam kurikulum.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
                <FiClock className="w-4 h-4" />
                <span className="text-sm font-medium">Coming Soon</span>
              </div>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-md mx-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  Fitur yang akan tersedia:
                </p>
                <ul className="text-xs text-left text-gray-600 dark:text-gray-400 space-y-1">
                  <li>" Sinkronisasi data mata kuliah</li>
                  <li>" Manajemen kurikulum program studi</li>
                  <li>" Monitoring status mata kuliah</li>
                  <li>" Export data mata kuliah</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
