"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiAward,
  FiGlobe,
  FiMapPin,
  FiTrendingUp,
  FiBook,
  FiStar,
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
import type { PrestasiData } from "../types";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardPrestasiPage() {
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
  const { data, loading, error, refetch } = useDashboardData<PrestasiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.PRESTASI,
    { semester: semesterParam, ...(scope.forcedFakultas ? { fakultas: scope.forcedFakultas } : (selectedFakultas && { fakultas: selectedFakultas })), ...(scope.forcedProdi && { prodi: scope.forcedProdi }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiAward className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiAward className="w-8 h-8 text-yellow-500" />
            Dashboard Prestasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Capaian prestasi mahasiswa dan publikasi ilmiah
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Prestasi"
                value={data.stats.total.total}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="yellow"
                trend={{ value: data.stats.total.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Nasional"
                value={data.stats.nasional.total}
                icon={<FiMapPin className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.nasional.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Internasional"
                value={data.stats.internasional.total}
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="purple"
                trend={{ value: data.stats.internasional.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Publikasi Ilmiah"
                value={data.stats.publikasi.total}
                icon={<FiBook className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: data.stats.publikasi.trend ?? 0, label: "YoY" }}
              />
            </div>

            {/* Row 1: Trend & Sebaran Tingkat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Prestasi */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Trend Prestasi Mahasiswa
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah prestasi 5 tahun terakhir</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <LineChart
                    data={data.trendPrestasi}
                    height={300}
                    showArea={true}
                    color="#eab308"
                  />
                </CardBody>
              </Card>

              {/* Prestasi per Tingkat (Stacked) */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Prestasi per Tingkat
                    </h2>
                    <p className="text-sm text-gray-500">Komposisi tingkat prestasi per tahun</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.prestasiPerTingkat}
                    stacked={true}
                    height={300}
                    colors={["#94a3b8", "#3b82f6", "#a855f7"]} // Lokal (Gray), Nas (Blue), Inter (Purple)
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Jenis & Top Prodi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Jenis Prestasi */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Jenis Bidang Prestasi
                    </h2>
                    <p className="text-sm text-gray-500">Kategori bidang prestasi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.jenisPrestasi}
                    donut={true}
                    height={300}
                    colors={["#f59e0b", "#ef4444", "#10b981", "#3b82f6"]}
                  />
                </CardBody>
              </Card>

              {/* Top 10 Prodi */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top 10 Prodi Berprestasi
                    </h2>
                    <p className="text-sm text-gray-500">Program studi dengan prestasi terbanyak</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.topProdiPrestasi}
                    height={300}
                    horizontal={true}
                    colors={["#f59e0b"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2.5: Fakultas & Dosen/Mhs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sebaran Fakultas */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sebaran Prestasi per Fakultas
                    </h2>
                    <p className="text-sm text-gray-500">Kontribusi prestasi per fakultas</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.prestasiPerFakultas}
                    height={300}
                    colors={["#10b981"]}
                  />
                </CardBody>
              </Card>

              {/* Dosen vs Mahasiswa */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Prestasi Mahasiswa vs Dosen
                    </h2>
                    <p className="text-sm text-gray-500">Perbandingan jumlah prestasi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.mahasiswaVsDosen}
                    donut={true}
                    height={300}
                    colors={["#3b82f6", "#f97316"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 3: Publikasi Section */}
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiBook className="w-6 h-6" /> Publikasi & HKI
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trend Publikasi */}
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardHeader className="pb-0">
                    <h3 className="font-semibold">Trend Publikasi</h3>
                  </CardHeader>
                  <CardBody>
                    <LineChart data={data.trendPublikasi} height={250} color="#10b981" />
                  </CardBody>
                </Card>

                {/* Jenis Publikasi */}
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardHeader className="pb-0">
                    <h3 className="font-semibold">Jenis Publikasi</h3>
                  </CardHeader>
                  <CardBody>
                    <PieChart data={data.jenisPublikasi} height={250} donut={true} showLegend={false} />
                  </CardBody>
                </Card>

                {/* HKI per Fakultas */}
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardHeader className="pb-0">
                    <h3 className="font-semibold">HKI/Paten per Fakultas</h3>
                  </CardHeader>
                  <CardBody>
                    <BarChart data={data.hkiPerFakultas} height={250} colors={["#8b5cf6"]} />
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
