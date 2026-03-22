"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

const APP_KEY = "myunila-integrator";

import { Card, CardBody } from "@heroui/react";
import { FiUsers, FiClock, FiTool } from "react-icons/fi";
import { MdSchool } from "react-icons/md";

export default function SiakaduPegawaiPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Pegawai SIAKADU"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Data Pegawai / Dosen SIAKADU
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sinkronisasi data pegawai dan dosen dari Sistem Akademik UNILA
          </p>
        </div>

        {/* Phase 2 Notice */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardBody className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center max-w-lg mx-auto">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl mb-6">
                <FiUsers className="w-10 h-10" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4">
                <FiClock className="w-4 h-4" />
                Coming Soon — Phase 2
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Modul Sinkronisasi Pegawai
              </h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Modul sinkronisasi data pegawai/dosen dari SIAKADU sedang dalam tahap pengembangan. 
                Fitur ini akan tersedia di Phase 2 pengembangan MyUnila Integrator.
              </p>

              {/* Features Preview */}
              <div className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <FiTool className="w-4 h-4 text-blue-600" />
                  Fitur yang akan tersedia:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Sinkronisasi data dosen aktif dari SIAKADU
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Sinkronisasi data tenaga kependidikan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Mapping data dengan SIKEP
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Histori dan monitoring sinkronisasi
                  </li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
