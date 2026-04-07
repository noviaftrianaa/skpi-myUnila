"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiAward,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  DrilldownBarChart,
  FilterPanel,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { MahasiswaData } from "../types";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardMahasiswaPage() {
  useRequireAuth();

  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");

  const { fakultas, semester, activeSemesters, getProdiByFakultas } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<MahasiswaData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.MAHASISWA,
    {
      semester: semesterParam,
      ...(selectedFakultas && { fakultas: selectedFakultas }),
      ...(selectedProdi && { prodi: selectedProdi }),
    }
  );

  const handleFakultasChange = (value: string) => {
    setSelectedFakultas(value);
    setSelectedProdi("");
  };

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
    setSelectedProdi("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiUsers className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUsers className="w-8 h-8 text-blue-600" />
            Dashboard Mahasiswa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Data akademik dan kemahasiswaan Universitas Lampung
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          semester={semester}
          selectedSemesters={selectedSemesters}
          onSemesterChange={setSelectedSemesters}
          fakultas={fakultas}
          selectedFakultas={selectedFakultas}
          onFakultasChange={handleFakultasChange}
          prodi={selectedFakultas ? getProdiByFakultas(selectedFakultas) : []}
          selectedProdi={selectedProdi}
          onProdiChange={setSelectedProdi}
          showProdi={true}
          onReset={handleReset}
        />

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Mahasiswa Aktif"
                value={data.stats.aktif.total}
                icon={<FiUserCheck className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.aktif.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Mahasiswa Baru"
                value={data.stats.baru.total}
                icon={<FiUserPlus className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: data.stats.baru.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Lulusan"
                value={data.stats.lulus.total}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="purple"
                trend={{ value: data.stats.lulus.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Cuti Akademik"
                value={data.stats.cuti.total}
                icon={<FiUserX className="w-6 h-6 text-white" />}
                color="yellow"
                trend={{ value: data.stats.cuti.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Drop Out (DO)"
                value={data.stats.do.total}
                icon={<FiUserX className="w-6 h-6 text-white" />}
                color="red"
                trend={{ value: data.stats.do.trend ?? 0, label: "YoY" }}
              />
            </div>

            {/* Row 1: Trends & Sebaran */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trend Mahasiswa Aktif</h2>
                    <p className="text-sm text-gray-500">5 tahun terakhir</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <LineChart data={data.trendMahasiswa} height={280} showArea={true} color="#2563eb" />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trend Mahasiswa Baru</h2>
                    <p className="text-sm text-gray-500">Penerimaan per tahun</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <LineChart data={data.trendMahasiswaBaru || []} height={280} showArea={true} color="#10b981" />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sebaran per Fakultas</h2>
                    <p className="text-sm text-gray-500">Klik untuk detail prodi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <DrilldownBarChart data={data.sebaranFakultas} title="Mahasiswa per Fakultas" height={280} color="#3b82f6" />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Demografi & Akademik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <h2 className="text-base font-semibold">Distribusi Jenjang</h2>
                </CardHeader>
                <CardBody>
                  <PieChart data={data.distribusiJenjang} donut={true} height={250} showLegend={false} />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <h2 className="text-base font-semibold">Jalur Masuk</h2>
                </CardHeader>
                <CardBody>
                  <PieChart data={data.jalurMasuk} donut={true} height={250} showLegend={false} colors={["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"]} />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <h2 className="text-base font-semibold">Sistem Pembiayaan</h2>
                </CardHeader>
                <CardBody>
                  <PieChart data={data.pembiayaan} donut={false} height={250} showLegend={false} colors={["#6366f1", "#14b8a6", "#f97316"]} />
                </CardBody>
              </Card>
            </div>

            {/* Gender & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <h2 className="text-base font-semibold">Distribusi Gender</h2>
                </CardHeader>
                <CardBody>
                  <PieChart data={data.genderDistribusi} donut={true} height={250} colors={["#3b82f6", "#ec4899"]} />
                </CardBody>
              </Card>

              {data.statusMahasiswa && data.statusMahasiswa.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardHeader>
                    <div>
                      <h2 className="text-base font-semibold">Status Mahasiswa</h2>
                      <p className="text-sm text-gray-500">Berdasarkan data kuliah_mhs semester terpilih</p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <BarChart data={data.statusMahasiswa} horizontal={true} height={250} colors={["#10b981"]} />
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Row 3: Distribusi IPK */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Distribusi IPK Mahasiswa
                  </h2>
                  <p className="text-sm text-gray-500">Sebaran Indeks Prestasi Kumulatif</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <BarChart
                  data={data.distribusiIPK}
                  height={300}
                  colors={["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"]}
                />
              </CardBody>
            </Card>

            {/* Row 4: IPK & Masa Studi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rata-rata IPK Mahasiswa
                    </h2>
                    <p className="text-sm text-gray-500">Rata-rata IPK per Fakultas</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.ipkPerFakultas}
                    height={300}
                    colors={["#8b5cf6"]}
                    xAxisLabel="IPK"
                  />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Masa Studi Lulusan
                    </h2>
                    <p className="text-sm text-gray-500">Distribusi lama masa studi</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.masaStudi}
                    donut={true}
                    height={300}
                    colors={["#10b981", "#3b82f6", "#ef4444"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Rasio Dosen : Mahasiswa */}
            {data.rasioDosenMahasiswa && data.rasioDosenMahasiswa.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rasio Dosen : Mahasiswa
                    </h2>
                    <p className="text-sm text-gray-500">Perbandingan jumlah dosen aktif terhadap mahasiswa per fakultas</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart data={data.rasioDosenMahasiswa} horizontal={true} height={350} colors={["#6366f1"]} xAxisLabel="Rasio" />
                </CardBody>
              </Card>
            )}

            {/* Row 5: Beasiswa & Tugas Akhir */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Status Penerima Beasiswa
                    </h2>
                    <p className="text-sm text-gray-500">Jumlah penerima beasiswa aktif</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.beasiswa}
                    horizontal={true}
                    height={300}
                    colors={["#f59e0b"]}
                    xAxisLabel="Jumlah Penerima"
                  />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mahasiswa Tugas Akhir
                    </h2>
                    <p className="text-sm text-gray-500">Mahasiswa sedang skripsi/tesis</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.tugasAkhir}
                    height={300}
                    colors={["#ec4899"]}
                    xAxisLabel="Mahasiswa"
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 6: Geografis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top 5 Asal Provinsi
                    </h2>
                    <p className="text-sm text-gray-500">Domisili asal mahasiswa</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.asalProvinsi}
                    height={300}
                    horizontal={true}
                    colors={["#3b82f6"]}
                  />
                </CardBody>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mahasiswa Asing
                    </h2>
                    <p className="text-sm text-gray-500">Sebaran negara asal mahasiswa internasional</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.mahasiswaAsing}
                    height={300}
                    colors={["#ec4899"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 7: Warning Status */}
            {data.warningMasaStudi && data.warningMasaStudi.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 shadow-md border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                      <FiUserX className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Early Warning: Masa Studi Maksimal
                      </h2>
                      <p className="text-sm text-gray-500">Mahasiswa yang telah melebihi batas masa studi normal</p>
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.warningMasaStudi.map((item, idx) => {
                      const total = data.warningMasaStudi.reduce((sum, i) => sum + i.value, 0);
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      const colors = ['from-red-500 to-red-600', 'from-orange-500 to-orange-600', 'from-yellow-500 to-yellow-600'];
                      const bgColors = ['bg-red-50 dark:bg-red-900/20', 'bg-orange-50 dark:bg-orange-900/20', 'bg-yellow-50 dark:bg-yellow-900/20'];
                      const textColors = ['text-red-700 dark:text-red-300', 'text-orange-700 dark:text-orange-300', 'text-yellow-700 dark:text-yellow-300'];

                      return (
                        <div key={idx} className={`p-4 rounded-xl ${bgColors[idx % 3]} border border-gray-200 dark:border-gray-700`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-sm font-semibold ${textColors[idx % 3]}`}>{item.name}</span>
                            <span className={`text-2xl font-bold ${textColors[idx % 3]}`}>{item.value.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`bg-gradient-to-r ${colors[idx % 3]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">{pct}% dari total warning</span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
