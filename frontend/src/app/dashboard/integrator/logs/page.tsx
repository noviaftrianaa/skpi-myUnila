"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import MyUnilaSyncLogsTable from "@/shared/components/myunila-integrator/MyUnilaSyncLogsTable";
import { myunilaSyncLogsService } from "@/lib/services/myunila/management/syncLogsService";
import { Card, CardBody, Spinner } from "@heroui/react";
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDatabase,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";
import { myunilaIntegratorMenuConfig } from "../config/menuConfig";

export default function SyncLogsPage() {
  useRequireAuth();

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<{
    totalSyncs: number;
    successRate: number;
    failedSyncs: number;
    averageDuration: number;
  } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await myunilaSyncLogsService.getSyncStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik sync logs");
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiFileText className="w-8 h-8 text-indigo-600" />
              Sync Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Riwayat sinkronisasi data dari SIKEP API
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Syncs */}
            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiDatabase className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-100">Total Syncs</p>
                    <h3 className="text-3xl font-bold text-white">{stats.totalSyncs.toLocaleString()}</h3>
                    <p className="text-[10px] text-purple-100/80">Total sinkronisasi</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Success Rate */}
            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-100">Success Rate</p>
                    <h3 className="text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</h3>
                    <p className="text-[10px] text-green-100/80">Tingkat keberhasilan</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Failed Syncs */}
            <Card className="bg-gradient-to-br from-red-500 via-red-600 to-pink-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiXCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-red-100">Failed Syncs</p>
                    <h3 className="text-3xl font-bold text-white">{stats.failedSyncs.toLocaleString()}</h3>
                    <p className="text-[10px] text-red-100/80">Sinkronisasi gagal</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Avg Duration */}
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiClock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-100">Avg Duration</p>
                    <h3 className="text-3xl font-bold text-white">
                      {(stats.averageDuration / 1000).toFixed(1)}s
                    </h3>
                    <p className="text-[10px] text-blue-100/80">Rata-rata durasi</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <MyUnilaSyncLogsTable />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
