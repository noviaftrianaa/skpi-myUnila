"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MahasiswaDataTable from "@/shared/components/data-unila/MahasiswaDataTable";
import { Card, CardBody, Spinner } from "@heroui/react";
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import mahasiswaDataService, { type MahasiswaStats } from "@/lib/services/data-unila/mahasiswaDataService";

const APP_KEY = "data-unila";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subtext?: string;
}

function StatCard({ icon, label, value, color, subtext }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-white">
              {typeof value === "number" ? value.toLocaleString("id-ID") : parseInt(value || "0").toLocaleString("id-ID")}
            </h3>
            {subtext && <p className="text-xs text-white/60 mt-0.5">{subtext}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function MahasiswaDataPage() {
  useRequireAuth();
  const [stats, setStats] = useState<MahasiswaStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    mahasiswaDataService.getStats({})
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data Mahasiswa"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Data Mahasiswa
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Raw data mahasiswa Universitas Lampung — filter, cari, dan download
          </p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" color="primary" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              icon={<FiUsers className="w-6 h-6" />}
              label="Total" value={stats.total}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<FiCheckCircle className="w-6 h-6" />}
              label="Aktif" value={stats.aktif}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <StatCard
              icon={<FiTrendingUp className="w-6 h-6" />}
              label="Lulus" value={stats.lulus}
              color="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <StatCard
              icon={<FiClock className="w-6 h-6" />}
              label="Cuti" value={stats.cuti}
              color="bg-gradient-to-br from-amber-500 to-orange-500"
            />
            <StatCard
              icon={<FiXCircle className="w-6 h-6" />}
              label="DO" value={stats.do_keluar}
              color="bg-gradient-to-br from-red-500 to-rose-600"
              subtext={`${stats.total_prodi} prodi, ${stats.total_fakultas} fak`}
            />
          </div>
        )}

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <MahasiswaDataTable />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
