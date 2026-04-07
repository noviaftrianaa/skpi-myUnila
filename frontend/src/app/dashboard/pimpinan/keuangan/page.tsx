"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiDollarSign,
  FiBriefcase,
  FiTrendingUp,
  FiCreditCard,
  FiActivity,
  FiPieChart,
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
import type { KeuanganData } from "../types";

const APP_KEY = "dashboard-pimpinan";

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Compact format for charts
const formatCompact = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

export default function DashboardKeuanganPage() {
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
  const { data, loading, error, refetch } = useDashboardData<KeuanganData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.KEUANGAN,
    { semester: semesterParam, ...(selectedFakultas && { fakultas: selectedFakultas }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiDollarSign className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiDollarSign className="w-8 h-8 text-green-600" />
            Dashboard Keuangan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Realisasi anggaran, pendapatan, dan pengeluaran
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <StatCard
                title="Total Pendapatan"
                value={formatCompact(data.stats.pendapatan.total as number)}
                icon={<FiDollarSign className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: data.stats.pendapatan.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Pendapatan SPP"
                value={formatCompact(data.stats.spp.total as number)}
                icon={<FiCreditCard className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.spp.trend ?? 0, label: "YoY" }}
              />
            </div>

            {/* Row 1: Trend SPP & Komposisi Pendapatan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Pendapatan SPP */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Trend Pendapatan UKT
                    </h2>
                    <p className="text-sm text-gray-500">Pertumbuhan pendapatan UKT 5 tahun terakhir</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <LineChart
                    data={data.trendPendapatanSPP}
                    height={300}
                    showArea={true}
                    color="#10b981"
                    valueFormatter={formatCompact}
                  />
                </CardBody>
              </Card>

              {/* Komposisi Pendapatan */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Komposisi Pendapatan
                    </h2>
                    <p className="text-sm text-gray-500">Sumber pendapatan universitas</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.komposisiPendapatan}
                    donut={true}
                    height={300}
                    valueFormatter={formatCompact}
                    colors={["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#6b7280"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Status Pembayaran & Pendapatan per UKT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Pembayaran */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Metode Pembayaran UKT
                    </h2>
                    <p className="text-sm text-gray-500">Distribusi metode pembayaran mahasiswa</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.statusPembayaran}
                    donut={false}
                    height={300}
                    colors={["#22c55e", "#ef4444", "#eab308", "#3b82f6"]}
                  />
                </CardBody>
              </Card>

              {/* Pendapatan per UKT */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sebaran Mahasiswa per Kelompok UKT
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah mahasiswa pada setiap kategori UKT</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.pendapatanPerUKT}
                    height={300}
                    colors={["#3b82f6"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 3: Pembayaran per Fakultas */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pembayaran UKT per Fakultas
                  </h2>
                  <p className="text-sm text-gray-500">Total pembayaran UKT per fakultas</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <BarChart
                  data={data.tunggakanFakultas}
                  height={300}
                  horizontal={true}
                  colors={["#3b82f6"]}
                  xAxisLabel="Total Pembayaran"
                />
              </CardBody>
            </Card>
          </>
        )}

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
