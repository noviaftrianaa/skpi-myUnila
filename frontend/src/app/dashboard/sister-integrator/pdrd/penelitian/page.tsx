"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Button } from "@heroui/react";
import { FiArrowLeft, FiRefreshCw, FiBookOpen } from "react-icons/fi";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PenelitianPage() {
  useRequireAuth();
  const { user } = useAuth();

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      menuConfig={sisterIntegratorMenuConfig}
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/sister-integrator"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Penelitian Dosen
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola dan sinkronisasi data penelitian dosen dari SISTER API
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 mb-1">Total Data</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                    -
                  </h3>
                  <p className="text-xs text-white/80 mt-1">Belum tersinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <FiRefreshCw className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 mb-1">Sync Terakhir</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                    -
                  </h3>
                  <p className="text-xs text-white/80 mt-1">Belum pernah sync</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 mb-1">Status</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight leading-none">
                    Coming Soon
                  </h3>
                  <p className="text-xs text-white/80 mt-1">Dalam pengembangan</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Coming Soon Card */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardBody className="p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <FiBookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Fitur Dalam Pengembangan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                Halaman Penelitian Dosen sedang dalam tahap pengembangan.
                Fitur ini akan segera tersedia untuk melakukan sinkronisasi data penelitian
                dosen dari SISTER API.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/sister-integrator">
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<FiArrowLeft />}
                  >
                    Kembali ke Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
