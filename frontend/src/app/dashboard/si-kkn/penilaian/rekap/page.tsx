"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiCheckCircle, FiXCircle, FiBarChart2, FiDownload, FiZap } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyNilaiAkhir } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const nilaiHurufColors: Record<string, "success" | "primary" | "warning" | "danger" | "default"> = {
  A: "success",
  AB: "primary",
  B: "primary",
  BC: "warning",
  C: "warning",
  D: "danger",
  E: "danger",
};

export default function RekapNilaiPage() {
  useRequireAuth();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalDinilai = dummyNilaiAkhir.length;
  const totalLulus = dummyNilaiAkhir.filter((n) => n.apakah_lulus).length;
  const totalTidakLulus = dummyNilaiAkhir.filter((n) => !n.apakah_lulus).length;
  const rataRata = (dummyNilaiAkhir.reduce((sum, n) => sum + n.total_nilai, 0) / dummyNilaiAkhir.length).toFixed(1);

  const statCards = [
    { label: "Total Dinilai", value: totalDinilai, icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Lulus", value: totalLulus, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Tidak Lulus", value: totalTidakLulus, icon: <FiXCircle className="w-6 h-6" />, gradient: "from-red-500 to-red-600" },
    { label: "Rata-rata Nilai", value: rataRata, icon: <FiBarChart2 className="w-6 h-6" />, gradient: "from-violet-500 to-purple-600" },
  ];

  const bobotMutuMap: Record<string, number> = { A: 4.0, AB: 3.5, B: 3.0, BC: 2.5, C: 2.0, D: 1.0, E: 0 };

  const columns: Column<(typeof dummyNilaiAkhir)[0]>[] = [
    {
      key: "nm_mahasiswa",
      label: "Nama",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span>,
    },
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.npm}</span>,
    },
    {
      key: "nm_prodi",
      label: "Prodi",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_prodi}</span>,
    },
    {
      key: "total_nilai",
      label: "Nilai Angka",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.total_nilai.toFixed(1)}</span>,
    },
    {
      key: "nilai_huruf",
      label: "Nilai Huruf",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={nilaiHurufColors[item.nilai_huruf] || "default"} variant="flat">
          {item.nilai_huruf}
        </Chip>
      ),
    },
    {
      key: "bobot_mutu",
      label: "Bobot Mutu",
      align: "center",
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{bobotMutuMap[item.nilai_huruf] ?? "-"}</span>,
    },
    {
      key: "apakah_lulus",
      label: "Lulus",
      align: "center",
      render: (item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.apakah_lulus
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {item.apakah_lulus ? "Lulus" : "Tidak Lulus"}
        </span>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" onPress={() => toast.success(`Detail nilai: ${item.nm_mahasiswa}`)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Nilai Akhir"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Nilai Akhir / Rekap</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rekapitulasi nilai akhir peserta KKN</p>
          </div>
          <div className="flex gap-2">
            <Button color="secondary" variant="flat" startContent={<FiZap className="w-4 h-4" />} onPress={() => toast.success("Nilai berhasil di-generate")}>
              Generate Nilai
            </Button>
            <Button color="success" variant="flat" startContent={<FiDownload className="w-4 h-4" />} onPress={() => toast.success("Data berhasil diekspor ke Excel")}>
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
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
              data={dummyNilaiAkhir}
              columns={columns}
              searchable={true}
              searchKeys={["nm_mahasiswa", "npm", "nm_prodi"]}
              searchPlaceholder="Cari mahasiswa..."
            />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
