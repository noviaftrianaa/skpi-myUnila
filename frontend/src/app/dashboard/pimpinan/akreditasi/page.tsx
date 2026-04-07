"use client";

import React from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiCheckCircle,
  FiAward,
  FiAlertCircle,
  FiList,
  FiGlobe,
  FiAlertTriangle,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  PieChart,
  BarChart,
  DrilldownBarChart,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { useDashboardData } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { AkreditasiData, AkreditasiDetail, AkreditasiIntlDetail } from "../types";

const APP_KEY = "dashboard-pimpinan";

const akredColumns: Column<AkreditasiDetail>[] = [
  { key: "fak", label: "Fakultas", sortable: true },
  { key: "prodi", label: "Program Studi", sortable: true },
  { key: "strata", label: "Jenjang", sortable: true },
  {
    key: "rank",
    label: "Peringkat",
    sortable: true,
    render: (item) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.rank === "Unggul" || item.rank === "A"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : item.rank === "Baik Sekali" || item.rank === "B"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        }`}
      >
        {item.rank}
      </span>
    ),
  },
  { key: "int", label: "Internasional", sortable: true },
  { key: "exp", label: "Masa Berlaku", sortable: true },
];

const intlDetailColumns: Column<AkreditasiIntlDetail>[] = [
  { key: "prodi", label: "Program Studi", sortable: true },
  { key: "fak", label: "Fakultas", sortable: true },
  { key: "strata", label: "Jenjang", sortable: true },
  { key: "lembaga", label: "Lembaga", sortable: true },
  { key: "exp", label: "Masa Berlaku", sortable: true },
];

export default function DashboardAkreditasiPage() {
  useRequireAuth();

  const { data, loading, error, refetch } = useDashboardData<AkreditasiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.AKREDITASI
  );

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiCheckCircle className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-blue-600" />
            Dashboard Akreditasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Status akreditasi program studi nasional (BAN-PT/LAM) dan internasional
          </p>
        </div>

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                title="Total Prodi"
                value={data.stats.totalProdi.total}
                icon={<FiList className="w-6 h-6 text-white" />}
                color="cyan"
                trend={undefined}
              />
              <StatCard
                title="Unggul / A"
                value={data.stats.unggul.total}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="green"
                trend={undefined}
              />
              <StatCard
                title="Baik Sekali / B"
                value={data.stats.baikSekali.total}
                icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                color="blue"
                trend={undefined}
              />
              <StatCard
                title="Baik / C"
                value={data.stats.baik.total}
                icon={<FiAlertCircle className="w-6 h-6 text-white" />}
                color="yellow"
                trend={undefined}
              />
              <StatCard
                title="Internasional"
                value={data.stats.internasional.total}
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="purple"
                trend={undefined}
              />
            </div>

            {/* Row 1: Distribusi & Kadaluarsa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribusi Peringkat */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Distribusi Peringkat Akreditasi
                    </h2>
                    <p className="text-sm text-gray-500">Sebaran peringkat akreditasi prodi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.distribusiAkreditasi}
                    donut={true}
                    height={300}
                    colors={["#10b981", "#059669", "#3b82f6", "#2563eb", "#f59e0b", "#d97706"]}
                  />
                </CardBody>
              </Card>

              {/* Masa Berlaku */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sisa Masa Berlaku
                    </h2>
                    <p className="text-sm text-gray-500">Estimasi waktu re-akreditasi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.statusKadaluarsa}
                    height={300}
                    horizontal={true}
                    colors={["#ef4444", "#f97316", "#f59e0b", "#10b981"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Sebaran per Fakultas (DrilldownBarChart) - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sebaran Akreditasi per Fakultas
                  </h2>
                  <p className="text-sm text-gray-500">
                    Jumlah program studi terakreditasi per fakultas (klik untuk detail prodi)
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <DrilldownBarChart
                  data={data.sebaranFakultas}
                  title="Sebaran Akreditasi per Fakultas"
                  color="#3b82f6"
                  height={400}
                />
              </CardBody>
            </Card>

            {/* Row 3: Akreditasi per Fakultas Stacked - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Akreditasi per Fakultas (Stacked)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Distribusi peringkat akreditasi di setiap fakultas
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <BarChart
                  data={data.akreditasiPerFakultas}
                  height={400}
                  stacked={true}
                  colors={["#10b981", "#059669", "#3b82f6", "#f59e0b", "#ef4444"]}
                />
              </CardBody>
            </Card>

            {/* Row 4: Akreditasi Internasional & Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Internasional Chart */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Akreditasi Internasional
                    </h2>
                    <p className="text-sm text-gray-500">
                      Jumlah prodi per lembaga akreditasi internasional
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.internasional}
                    height={350}
                    horizontal={true}
                    colors={["#8b5cf6"]}
                  />
                </CardBody>
              </Card>

              {/* Internasional Detail Table */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detail Akreditasi Internasional
                    </h2>
                    <p className="text-sm text-gray-500">
                      Daftar prodi dengan sertifikasi internasional aktif
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-0">
                  <DataTable
                    data={data.internasionalDetail}
                    columns={intlDetailColumns}
                    searchable
                    searchKeys={["prodi", "fak", "lembaga"]}
                    searchPlaceholder="Cari prodi internasional..."
                    defaultRowsPerPage={5}
                    noWrapper
                  />
                </CardBody>
              </Card>
            </div>

            {/* Expiring Warning Card */}
            {data.expiringProdi.length > 0 && (
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                      <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                        Peringatan: Akreditasi Segera Kadaluarsa
                      </h2>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {data.expiringProdi.length} program studi memiliki akreditasi yang akan
                        berakhir dalam 1 tahun ke depan
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Divider className="bg-red-200 dark:bg-red-800" />
                <CardBody>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-red-200 dark:divide-red-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Program Studi
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Fakultas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Jenjang
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Peringkat
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Masa Berlaku
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 dark:divide-red-900">
                        {data.expiringProdi.map((row, idx) => (
                          <tr key={idx} className="hover:bg-red-100/50 dark:hover:bg-red-900/30">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                              {row.prodi}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {row.fak}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {row.strata}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  row.rank === "Unggul" || row.rank === "A"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : row.rank === "Baik Sekali" || row.rank === "B"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {row.rank}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400">
                              {row.exp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Detail Table (DataTable) - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Status Akreditasi Program Studi
                  </h2>
                  <p className="text-sm text-gray-500">
                    Daftar lengkap status akreditasi nasional dan internasional
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <DataTable
                  data={data.detailTable}
                  columns={akredColumns}
                  searchable
                  searchKeys={["prodi", "fak", "rank", "strata"]}
                  searchPlaceholder="Cari program studi..."
                  noWrapper
                />
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
