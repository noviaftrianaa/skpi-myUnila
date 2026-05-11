"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiActivity,
  FiBookOpen,
  FiUsers,
  FiTarget,
  FiLayers,
  FiDollarSign,
  FiAward,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  FilterPanel,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { LitabmasData } from "../types";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";

const APP_KEY = "dashboard-pimpinan";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value);
};

export default function DashboardLitabmasPage() {
  useRequireAuth();
    const scope = useRoleBasedScope();

  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedFakultas, setSelectedFakultas] = useState("");

  const { fakultas, semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<LitabmasData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.LITABMAS,
    { semester: semesterParam, ...(scope.forcedFakultas ? { fakultas: scope.forcedFakultas } : (selectedFakultas && { fakultas: selectedFakultas })), ...(scope.forcedProdi && { prodi: scope.forcedProdi }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiActivity className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiActivity className="w-8 h-8 text-cyan-600" />
            Dashboard Penelitian & Pengabdian
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoring kegiatan penelitian dan pengabdian masyarakat (Litabmas)
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          semester={semester}
          selectedSemesters={selectedSemesters}
          onSemesterChange={setSelectedSemesters}
          fakultas={fakultas}
          selectedFakultas={selectedFakultas}
          showFakultas={scope.canChangeFakultas}
          scopeBadge={scope.scopeName}
          onFakultasChange={setSelectedFakultas}
          showProdi={false}
          onReset={handleReset}
        />

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* Stats — 4 metric konsisten dengan dashboard lain */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Penelitian"
                value={data.stats.penelitian.total}
                icon={<FiBookOpen className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.penelitian.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Total Pengabdian"
                value={data.stats.pengabdian.total}
                icon={<FiUsers className="w-6 h-6 text-white" />}
                color="cyan"
                trend={{ value: data.stats.pengabdian.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Sumber Dana"
                value={data.sumberDana?.length ?? 0}
                subtitle="Skema pendanaan aktif"
                icon={<FiDollarSign className="w-6 h-6 text-white" />}
                color="green"
              />
              <StatCard
                title="Top Fakultas"
                value={data.sebaranFakultas?.[0]?.value ?? 0}
                subtitle={data.sebaranFakultas?.[0]?.name ?? "—"}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="purple"
              />
            </div>

            {/* Row 1: Trend & Sumber Dana */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Litabmas - Stacked Bar (Modified Logic needed for grouped trend, using simple stacked for now) */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Trend Kegiatan Litabmas
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah judul per tahun</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  {/* Note: Using clustered bar chart logic manually or creating a new chart type if strict req.
                       Here reusing BarChart with category support we added earlier
                   */}
                  <BarChart
                    data={data.trendLitabmas}
                    height={300}
                    colors={["#3b82f6", "#f97316"]}
                  />
                </CardBody>
              </Card>

              {/* Sumber Dana */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sumber Dana Penelitian
                    </h2>
                    <p className="text-sm text-gray-500">Distribusi sumber pendanaan</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.sumberDana}
                    donut={false}
                    height={300}
                    valueFormatter={formatCurrency}
                    colors={["#10b981", "#3b82f6", "#f59e0b", "#6b7280", "#8b5cf6"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Sebaran & Fokus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sebaran per Fakultas (Grouped Bar) */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Kinerja per Fakultas
                    </h2>
                    <p className="text-sm text-gray-500">Perbandingan jumlah penelitian & pengabdian</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.sebaranFakultas}
                    height={320}
                    colors={["#3b82f6", "#f97316"]}
                  />
                </CardBody>
              </Card>

              {/* Bidang Fokus */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Bidang Fokus Riset
                    </h2>
                    <p className="text-sm text-gray-500">Topik penelitian unggulan</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.bidangFokus}
                    donut={true}
                    height={320}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 3: Skim Kegiatan */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Distribusi per Skim Kegiatan
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah usulan berdasarkan skim</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.skimKegiatan}
                    height={300}
                    horizontal={true}
                    colors={["#8b5cf6"]}
                  />
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
