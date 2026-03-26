"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiLayers, FiFileText, FiCheckCircle, FiClock, FiEye, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyBatch } from "@/lib/services/sim-bak/dummyData";
import type { BatchPenetapan } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

const statusConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "danger" }> = {
  draft: { label: "Draft", color: "default" },
  verifikasi_fakultas: { label: "Verifikasi Fakultas", color: "warning" },
  finalisasi: { label: "Finalisasi", color: "primary" },
  terbit: { label: "Terbit", color: "success" },
};

const jenisSkConfig: Record<string, { label: string; tw: string }> = {
  HABIS_MASA_MUKIM: { label: "HMM", tw: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  PUTUS_STUDI: { label: "Putus Studi", tw: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

export default function BatchPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const filtered = useMemo(() => {
    let result = [...dummyBatch];
    if (filterJenis) result = result.filter((b) => b.jenis_sk === filterJenis);
    if (filterStatus) result = result.filter((b) => b.status === filterStatus);
    return result;
  }, [filterJenis, filterStatus]);

  const totalBatch = dummyBatch.length;
  const draftCount = dummyBatch.filter((b) => b.status === "draft").length;
  const verifikasiCount = dummyBatch.filter((b) => b.status === "verifikasi_fakultas").length;
  const terbitCount = dummyBatch.filter((b) => b.status === "terbit").length;

  const statCards = [
    { label: "Total Batch", value: totalBatch, icon: <FiLayers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Draft", value: draftCount, icon: <FiFileText className="w-6 h-6" />, gradient: "from-gray-400 to-gray-500" },
    { label: "Verifikasi Fakultas", value: verifikasiCount, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Terbit", value: terbitCount, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
  ];

  const columns: Column<BatchPenetapan>[] = [
    {
      key: "no_sk",
      label: "No. SK",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
          {item.no_sk || "Belum Terbit"}
        </span>
      ),
    },
    {
      key: "jenis_sk",
      label: "Jenis SK",
      sortable: true,
      render: (item) => {
        const cfg = jenisSkConfig[item.jenis_sk];
        return cfg ? (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.tw}`}>
            {cfg.label}
          </span>
        ) : (
          item.jenis_sk
        );
      },
    },
    {
      key: "periode_akademik",
      label: "Periode",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.periode_akademik}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const cfg = statusConfig[item.status];
        return <Chip size="sm" color={cfg?.color || "default"} variant="flat">{cfg?.label || item.status}</Chip>;
      },
    },
    {
      key: "jumlah_kandidat",
      label: "Jumlah Kandidat",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.jumlah_kandidat}</span>,
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button
          size="sm"
          variant="flat"
          color="primary"
          startContent={<FiEye className="w-4 h-4" />}
          onPress={() => router.push(`/dashboard/sim-bak/batch/${item.id_batch}`)}
        >
          Lihat
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Batch Administrasi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Batch Administrasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola batch penetapan HMM dan Putus Studi
            </p>
          </div>
          <Button
            color="primary"
            startContent={<FiPlus className="w-4 h-4" />}
            onPress={() => router.push("/dashboard/sim-bak/batch/create")}
          >
            Buat Batch Baru
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              data={filtered}
              columns={columns}
              searchable={true}
              searchKeys={["no_sk", "jenis_sk", "periode_akademik"]}
              searchPlaceholder="Cari batch..."
              filterSlot={
                <div className="flex gap-2">
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                  >
                    <option value="">Semua Jenis</option>
                    <option value="HABIS_MASA_MUKIM">HMM</option>
                    <option value="PUTUS_STUDI">Putus Studi</option>
                  </select>
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="verifikasi_fakultas">Verifikasi Fakultas</option>
                    <option value="finalisasi">Finalisasi</option>
                    <option value="terbit">Terbit</option>
                  </select>
                </div>
              }
            />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
