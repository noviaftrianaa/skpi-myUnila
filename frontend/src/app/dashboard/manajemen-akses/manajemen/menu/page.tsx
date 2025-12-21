"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MenuTable from "@/shared/components/manakses/MenuTable";
import {
  Spinner,
  Card,
  CardBody,
} from "@heroui/react";
import { MdSecurity } from "react-icons/md";
import { FiList, FiCheckCircle, FiXCircle, FiLayers } from "react-icons/fi";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { type MenuStats } from "@/lib/services/manakses/menuService";

const APP_KEY = "manajemen-akses";

export default function MenuPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [menuStats, setMenuStats] = useState<MenuStats | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="Manajemen Akses"
        appIcon={<MdSecurity className="w-6 h-6 text-white" />}
        appKey={APP_KEY}
        fallbackMenus={manajemenAksesMenuConfig}
        pageTitle="Menu Aplikasi"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Menu Aplikasi"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Menu Aplikasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola menu dan navigasi untuk setiap aplikasi
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {menuStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Menu Card */}
            <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiList className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-indigo-100">Total Menu</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">All</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuStats.total_menus?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-indigo-100/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      Semua menu terdaftar
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Menu Aktif Card */}
            <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-emerald-100">Menu Aktif</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Active</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuStats.total_aktif?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-emerald-100/80">
                      Menu dalam status aktif
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Menu Nonaktif Card */}
            <Card className="bg-gradient-to-br from-rose-500 via-red-600 to-pink-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiXCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-rose-100">Menu Nonaktif</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Inactive</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuStats.total_nonaktif?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-rose-100/80">
                      Menu dalam status nonaktif
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Parent Menu Card */}
            <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiLayers className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-orange-100">Parent / Child</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Hierarchy</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuStats.total_parent?.toLocaleString() || "0"} / {menuStats.total_child?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-orange-100/80">
                      Menu parent dan child
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Table */}
        <MenuTable onStatsLoaded={setMenuStats} />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
