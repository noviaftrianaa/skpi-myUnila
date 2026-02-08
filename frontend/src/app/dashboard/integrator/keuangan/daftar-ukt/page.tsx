"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import KeuanganDaftarUktTable from "@/shared/components/keuangan-integrator/KeuanganDaftarUktTable";
import {
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import {
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiList,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { keuanganClient } from "@/lib/api/keuanganClient";

interface DaftarUktStats {
  total_daftar_ukt: number;
  total_prodi: number;
  total_mapped: number;
  total_unmapped: number;
  last_sync?: string;
}

export default function DaftarUktManagementPage() {
  useRequireAuth();

  // State
  const [stats, setStats] = useState<DaftarUktStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await keuanganClient.get("/daftar-ukt/stats", {
        params: { _t: Date.now() }
      });
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        total_daftar_ukt: 0,
        total_prodi: 0,
        total_mapped: 0,
        total_unmapped: 0,
        last_sync: undefined,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Daftar UKT"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Daftar UKT
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Data kelas UKT per prodi per tahun dari SIMPEDAM
          </p>
        </div>

        {/* Statistics Cards - 4 Cards Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Daftar UKT Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Total Daftar UKT</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_daftar_ukt ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Prodi Card */}
          <Card className="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-teal-100 mb-1">Total Prodi</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_prodi ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prodi Mapped Card */}
          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-100 mb-1">Mapped</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_mapped ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-100 mb-1">Last Sync</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {formatDate(stats?.last_sync)}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <KeuanganDaftarUktTable />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
