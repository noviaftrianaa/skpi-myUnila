"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiBook,
  FiFileText,
  FiGlobe,
  FiAward,
  FiTrendingUp,
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
import type { PublikasiData } from "../types";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardPublikasiPage() {
  useRequireAuth();

  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedFakultas, setSelectedFakultas] = useState("");

  const { fakultas, semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<PublikasiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.PUBLIKASI,
    { semester: semesterParam, ...(selectedFakultas && { fakultas: selectedFakultas }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiBook className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBook className="w-8 h-8 text-indigo-600" />
            Dashboard Publikasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Indikator kinerja publikasi ilmiah dosen
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          semester={semester}
          selectedSemesters={selectedSemesters}
          onSemesterChange={setSelectedSemesters}
          fakultas={fakultas}
          selectedFakultas={selectedFakultas}
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
                title="Total Publikasi"
                value={data.stats.total.total}
                icon={<FiBook className="w-6 h-6 text-white" />}
                color="indigo"
                trend={{ value: data.stats.total.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Top Penulis"
                value={data.topAuthors?.[0]?.value ?? 0}
                subtitle={data.topAuthors?.[0]?.name ?? "—"}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="green"
              />
              <StatCard
                title="Fakultas Aktif"
                value={data.perFakultas?.length ?? 0}
                subtitle="Memiliki publikasi"
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="cyan"
              />
              <StatCard
                title="Pertumbuhan"
                value={(() => {
                  const t = data.trendPublikasi || [];
                  if (t.length < 2) return "—";
                  const last = Number(t[t.length - 1]?.value || 0);
                  const prev = Number(t[t.length - 2]?.value || 0);
                  if (!prev) return "—";
                  const pct = Math.round(((last - prev) / prev) * 100);
                  return `${pct > 0 ? "+" : ""}${pct}%`;
                })()}
                subtitle="Year-over-Year"
                icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                color="purple"
              />
            </div>

            {/* Row 1: Trend & Jenis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Publikasi */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pertumbuhan Publikasi
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah dokumen publikasi 5 tahun terakhir</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <LineChart
                    data={data.trendPublikasi}
                    height={300}
                    showArea={true}
                    color="#6366f1"
                  />
                </CardBody>
              </Card>

              {/* Jenis Publikasi */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Jenis Publikasi
                    </h2>
                    <p className="text-sm text-gray-500">Proporsi jenis luaran</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.jenisPublikasi}
                    donut={true}
                    height={300}
                    colors={["#3b82f6", "#10b981", "#f97316", "#ef4444", "#f59e0b"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Top Authors & Sebaran Fakultas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Authors */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Dosen Produktif
                    </h2>
                    <p className="text-sm text-gray-500">Berdasarkan jumlah publikasi tahun ini</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.topAuthors}
                    height={300}
                    horizontal={true}
                    colors={["#10b981"]}
                  />
                </CardBody>
              </Card>

              {/* Sebaran Fakultas */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Publikasi per Fakultas
                    </h2>
                    <p className="text-sm text-gray-500">Kontribusi publikasi ilmiah</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.perFakultas}
                    height={300}
                    colors={["#3b82f6"]}
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
