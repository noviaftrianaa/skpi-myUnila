"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import RoleAccessLogsTable from "@/shared/components/manakses/RoleAccessLogsTable";
import {
  Card,
  CardBody,
} from "@heroui/react";
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { loggerService, type LoggerStats } from "@/lib/services/manakses/loggerService";

const APP_KEY = "manajemen-akses";

export default function LogAksesPage() {
  useRequireAuth();

  const [stats, setStats] = useState<LoggerStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const statsData = await loggerService.getStats();
        if (isMounted) {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Log Akses"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Log Akses (Role-Based)
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Riwayat akses berdasarkan role pengguna
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Access Logs Card */}
          <Card className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiActivity className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-rose-100">Total Akses</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">All Time</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.access.total_access_logs?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-rose-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
                    Total seluruh akses
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Successful Access Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Akses Berhasil</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Success</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.access.successful_access?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    Akses yang berhasil
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Failed Access Card */}
          <Card className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-red-100">Akses Gagal</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Failed</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.access.failed_access?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-red-100/80">
                    Akses yang ditolak/error
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-cyan-600 to-sky-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">Aktivitas</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Recent</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">24 Jam</span>
                      <span className="font-bold">{stats?.access.access_last_24hours?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">7 Hari</span>
                      <span className="font-bold">{stats?.access.access_last_7days?.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <RoleAccessLogsTable />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
