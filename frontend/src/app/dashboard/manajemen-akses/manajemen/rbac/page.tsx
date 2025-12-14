"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import RolePenggunaTable from "@/shared/components/manakses/RolePenggunaTable";
import MenuRoleTable from "@/shared/components/manakses/MenuRoleTable";
import {
  Spinner,
  Card,
  CardBody,
} from "@heroui/react";
import { MdSecurity } from "react-icons/md";
import { FiUsers, FiLock, FiShield } from "react-icons/fi";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import { type MenuRoleStats } from "@/lib/services/manakses/menuRoleService";

export default function RBACPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu-role");
  const [menuRoleStats, setMenuRoleStats] = useState<MenuRoleStats | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout
        appName="Manajemen Akses"
        appIcon={<MdSecurity className="w-6 h-6 text-white" />}
        menuConfig={manajemenAksesMenuConfig}
        pageTitle="Role Base Access"
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
      pageTitle="Role Base Access"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Role Base Access Control
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola assignment peran ke pengguna dan akses menu di sistem
            </p>
          </div>
        </div>

        {/* Stats Cards - show when on menu-role tab */}
        {activeTab === "menu-role" && menuRoleStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Assignment Card */}
            <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiShield className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-indigo-100">Total Assignment</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">All</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuRoleStats.total_assignments?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-indigo-100/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      Total menu-role assignments
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Menu dengan Role Card */}
            <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiLock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-emerald-100">Menu dengan Role</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Active</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuRoleStats.total_menus_with_roles?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-emerald-100/80">
                      Menu yang sudah di-assign role
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Role dengan Menu Card */}
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiUsers className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-blue-100">Role dengan Menu</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Roles</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuRoleStats.total_roles_with_menus?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-blue-100/80">
                      Role yang memiliki akses menu
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Aplikasi RBAC Card */}
            <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <MdSecurity className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-orange-100">Aplikasi RBAC</p>
                      <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white">Apps</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                      {menuRoleStats.total_aplikasi_with_rbac?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-[10px] text-orange-100/80">
                      Aplikasi dengan RBAC aktif
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Modern Segmented Navigation */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-slate-700/50 inline-flex">
          <button
            onClick={() => setActiveTab("menu-role")}
            className={`
              relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300 ease-out
              ${activeTab === "menu-role"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50"
              }
            `}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === "menu-role" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"}`}>
              <FiLock className={`w-4 h-4 ${activeTab === "menu-role" ? "text-white" : "text-purple-500"}`} />
            </div>
            <span>Menu Role</span>
            {activeTab === "menu-role" && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("role-pengguna")}
            className={`
              relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300 ease-out
              ${activeTab === "role-pengguna"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50"
              }
            `}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === "role-pengguna" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"}`}>
              <FiUsers className={`w-4 h-4 ${activeTab === "role-pengguna" ? "text-white" : "text-indigo-500"}`} />
            </div>
            <span>Role Pengguna</span>
            {activeTab === "role-pengguna" && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === "menu-role" && <MenuRoleTable onStatsLoaded={setMenuRoleStats} />}
          {activeTab === "role-pengguna" && <RolePenggunaTable />}
        </div>
      </div>
    </DashboardLayout>
  );
}
