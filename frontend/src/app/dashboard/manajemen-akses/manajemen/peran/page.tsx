"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import PeranTable from "@/shared/components/manakses/PeranTable";
import {
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import {
  FiShield,
  FiUsers,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { type PeranStats } from "@/lib/services/manakses/peranService";

export default function PeranPage() {
  useRequireAuth();

  const [stats, setStats] = useState<PeranStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStatsLoaded = (loadedStats: PeranStats) => {
    setStats(loadedStats);
  };

  if (isLoading) {
    return (
      <DashboardLayout
        appName="Manajemen Akses"
        appIcon={<MdSecurity className="w-6 h-6 text-white" />}
        menuConfig={manajemenAksesMenuConfig}
        pageTitle="Peran"
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
      pageTitle="Peran"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Peran
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola data peran (roles) terdaftar di sistem Manajemen Akses
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Peran Card */}
          <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiShield className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-indigo-100">Total Peran</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_peran?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-indigo-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    Total seluruh peran
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengguna Assigned Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Total Assignment</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Users</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_pengguna_assigned?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    Pengguna dengan peran
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Peran dengan SK Card */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Perlu SK</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">SK</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_dengan_sk?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">
                    Peran memerlukan SK
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Peran Tanpa SK Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">Tanpa SK</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Direct</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_tanpa_sk?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-blue-100/80">
                    Peran tanpa SK
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <PeranTable onStatsLoaded={handleStatsLoaded} />
      </div>
    </DashboardLayout>
  );
}
