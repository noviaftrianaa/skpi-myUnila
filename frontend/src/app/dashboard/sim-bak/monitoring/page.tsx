"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiPauseCircle, FiAward, FiClock, FiDownload, FiBarChart2 } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyMahasiswaAktif, dummyLulusan, fakultasList } from "@/lib/services/sim-bak/dummyData";
import toast, { Toaster } from "react-hot-toast";

const tabs = [
  { key: "aktif", label: "Mahasiswa Aktif", icon: <FiUsers className="w-4 h-4" /> },
  { key: "lulusan", label: "Lulusan", icon: <FiAward className="w-4 h-4" /> },
];

const statusColors: Record<string, { color: "success" | "warning" | "default" }> = {
  Aktif: { color: "success" },
  Cuti: { color: "warning" },
};

export default function MonitoringPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("aktif");
  const [filterFakultasAktif, setFilterFakultasAktif] = useState("");
  const [filterFakultasLulusan, setFilterFakultasLulusan] = useState("");
  const [filterTahunLulus, setFilterTahunLulus] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Mahasiswa Aktif stats
  const totalAktif = dummyMahasiswaAktif.filter((m) => m.status === "Aktif").length;
  const totalCuti = dummyMahasiswaAktif.filter((m) => m.status === "Cuti").length;
  const avgIpk = (dummyMahasiswaAktif.reduce((sum, m) => sum + m.ipk, 0) / dummyMahasiswaAktif.length).toFixed(2);

  // Lulusan stats
  const totalLulusan = dummyLulusan.length;
  const avgLamaStudi = (dummyLulusan.reduce((sum, l) => sum + l.lama_studi, 0) / dummyLulusan.length).toFixed(1);

  // Filtered data
  const filteredAktif = useMemo(() => {
    if (!filterFakultasAktif) return dummyMahasiswaAktif;
    return dummyMahasiswaAktif.filter((m) => m.fakultas === filterFakultasAktif);
  }, [filterFakultasAktif]);

  const filteredLulusan = useMemo(() => {
    let result = [...dummyLulusan];
    if (filterFakultasLulusan) result = result.filter((l) => l.fakultas === filterFakultasLulusan);
    if (filterTahunLulus) result = result.filter((l) => l.tahun_lulus === parseInt(filterTahunLulus));
    return result;
  }, [filterFakultasLulusan, filterTahunLulus]);

  // Unique tahun lulus
  const tahunLulusOptions = useMemo(() => {
    const years = [...new Set(dummyLulusan.map((l) => l.tahun_lulus))].sort((a, b) => b - a);
    return years;
  }, []);

  const handleExport = () => {
    toast.success("Data berhasil diekspor ke CSV");
  };

  // Columns for Mahasiswa Aktif
  const aktifColumns: Column<(typeof dummyMahasiswaAktif)[0]>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.npm}</span>,
    },
    {
      key: "nama",
      label: "Nama",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nama}</span>,
    },
    {
      key: "prodi",
      label: "Prodi",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.prodi}</span>,
    },
    {
      key: "fakultas",
      label: "Fakultas",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.fakultas}</span>,
    },
    {
      key: "semester",
      label: "Semester",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.semester}</span>,
    },
    {
      key: "ipk",
      label: "IPK",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.ipk}</span>,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={statusColors[item.status]?.color || "default"} variant="flat">
          {item.status}
        </Chip>
      ),
    },
  ];

  // Columns for Lulusan
  const lulusanColumns: Column<(typeof dummyLulusan)[0]>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.npm}</span>,
    },
    {
      key: "nama",
      label: "Nama",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nama}</span>,
    },
    {
      key: "prodi",
      label: "Prodi",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.prodi}</span>,
    },
    {
      key: "fakultas",
      label: "Fakultas",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.fakultas}</span>,
    },
    {
      key: "tahun_lulus",
      label: "Tahun Lulus",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.tahun_lulus}</span>,
    },
    {
      key: "ipk",
      label: "IPK",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.ipk}</span>,
    },
    {
      key: "lama_studi",
      label: "Lama Studi (smt)",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.lama_studi}</span>,
    },
  ];

  const aktifStatCards = [
    { label: "Total Aktif", value: totalAktif, icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Cuti", value: totalCuti, icon: <FiPauseCircle className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Rata-rata IPK", value: avgIpk, icon: <FiBarChart2 className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
  ];

  const lulusanStatCards = [
    { label: "Total Lulusan", value: totalLulusan, icon: <FiAward className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Rata-rata Lama Studi", value: `${avgLamaStudi} smt`, icon: <FiClock className="w-6 h-6" />, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Monitoring"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Monitoring
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitoring data mahasiswa aktif dan lulusan
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Mahasiswa Aktif */}
        {activeTab === "aktif" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {aktifStatCards.map((card) => (
                <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* DataTable */}
            <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-0">
                <DataTable
                  data={filteredAktif}
                  columns={aktifColumns}
                  searchable={true}
                  searchKeys={["npm", "nama", "prodi", "fakultas"]}
                  searchPlaceholder="Cari mahasiswa..."
                  filterSlot={
                    <div className="flex gap-2">
                      <select
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        value={filterFakultasAktif}
                        onChange={(e) => setFilterFakultasAktif(e.target.value)}
                      >
                        <option value="">Semua Fakultas</option>
                        {fakultasList.map((f) => (
                          <option key={f.id} value={f.nama}>{f.nama}</option>
                        ))}
                      </select>
                    </div>
                  }
                  actionSlot={
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={<FiDownload className="w-4 h-4" />}
                      onPress={handleExport}
                    >
                      Export CSV
                    </Button>
                  }
                />
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab: Lulusan */}
        {activeTab === "lulusan" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lulusanStatCards.map((card) => (
                <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* DataTable */}
            <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-0">
                <DataTable
                  data={filteredLulusan}
                  columns={lulusanColumns}
                  searchable={true}
                  searchKeys={["npm", "nama", "prodi", "fakultas"]}
                  searchPlaceholder="Cari lulusan..."
                  filterSlot={
                    <div className="flex gap-2">
                      <select
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        value={filterTahunLulus}
                        onChange={(e) => setFilterTahunLulus(e.target.value)}
                      >
                        <option value="">Semua Tahun</option>
                        {tahunLulusOptions.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <select
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        value={filterFakultasLulusan}
                        onChange={(e) => setFilterFakultasLulusan(e.target.value)}
                      >
                        <option value="">Semua Fakultas</option>
                        {fakultasList.map((f) => (
                          <option key={f.id} value={f.nama}>{f.nama}</option>
                        ))}
                      </select>
                    </div>
                  }
                  actionSlot={
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={<FiDownload className="w-4 h-4" />}
                      onPress={handleExport}
                    >
                      Export CSV
                    </Button>
                  }
                />
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
