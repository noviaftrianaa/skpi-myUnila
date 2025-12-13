"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import PenggunaTable from "@/shared/components/manakses/PenggunaTable";
import {
  Card,
  CardBody,
} from "@heroui/react";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiShield,
} from "react-icons/fi";
import { MdSecurity } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { type PenggunaStats } from "@/lib/services/manakses/penggunaService";

export default function DaftarPenggunaPage() {
  useRequireAuth();

  const [stats, setStats] = useState<PenggunaStats | null>(null);

  const handleStatsLoaded = (loadedStats: PenggunaStats) => {
    setStats(loadedStats);
  };

  return (
    <DashboardLayout
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      menuConfig={manajemenAksesMenuConfig}
      pageTitle="Daftar Pengguna"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Pengguna
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola data pengguna sistem Manajemen Akses
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pengguna Card */}
          <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-indigo-100">Total Pengguna</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_pengguna?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-indigo-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    Total seluruh pengguna
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengguna Aktif Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Pengguna Aktif</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Active</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_aktif?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    Status aktif dan tidak disable
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pengguna Tidak Aktif Card */}
          <Card className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-red-100">Tidak Aktif</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Inactive</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_nonaktif?.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-red-100/80">
                    Status tidak aktif atau disable
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sebaran Peran Card */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiShield className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Sebaran Peran</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Roles</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-100">Mahasiswa</span>
                      <span className="font-bold">{stats?.role_mahasiswa?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-100">Dosen</span>
                      <span className="font-bold">{stats?.role_dosen?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-100">Tendik</span>
                      <span className="font-bold">{stats?.role_tendik?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-100">Lainnya</span>
                      <span className="font-bold">{stats?.role_lainnya?.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <PenggunaTable onStatsLoaded={handleStatsLoaded} />
      </div>
    </DashboardLayout>
  );
}
