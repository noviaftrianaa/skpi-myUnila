"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiClock, FiLoader, FiCheckCircle, FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyPengajuan, dummyJenisLayanan } from "@/lib/services/sim-bak/dummyData";
import type { Pengajuan } from "@/lib/services/sim-bak/types";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function VerifikasiPengajuanPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLayanan, setFilterLayanan] = useState("");

  const verifikasiStatuses = ["diajukan", "perlu_perbaikan", "diverifikasi"];

  const filtered = useMemo(() => {
    let data = dummyPengajuan.filter((p) => verifikasiStatuses.includes(p.status));
    if (filterStatus) data = data.filter((p) => p.status === filterStatus);
    if (filterLayanan) data = data.filter((p) => p.kode_layanan === filterLayanan);
    return data;
  }, [filterStatus, filterLayanan]);

  const countByStatus = useMemo(() => {
    const all = dummyPengajuan.filter((p) => verifikasiStatuses.includes(p.status));
    return {
      menunggu: all.filter((p) => p.status === "diajukan").length,
      proses: all.filter((p) => p.status === "perlu_perbaikan").length,
      selesai: all.filter((p) => p.status === "diverifikasi").length,
    };
  }, []);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<Pengajuan>[] = [
    {
      key: "no_pengajuan",
      label: "No. Pengajuan",
      render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.no_pengajuan}</span>,
    },
    {
      key: "pemohon",
      label: "Pemohon",
      render: (item) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_pemohon}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.data_pemohon?.npm}</p>
        </div>
      ),
    },
    {
      key: "layanan",
      label: "Layanan",
      render: (item) => <span className="text-sm">{item.nm_layanan}</span>,
    },
    {
      key: "tgl_pengajuan",
      label: "Tgl Ajuan",
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.tgl_pengajuan ? new Date(item.tgl_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Chip size="sm" variant="flat" color={statusChipColor[item.status] || "default"}>
          {statusLabel[item.status] || item.status}
        </Chip>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
          onPress={() => router.push(`/dashboard/sim-bak/admin/verifikasi/${item.id_pengajuan}`)}>
          Lihat
        </Button>
      ),
    },
  ];

  const layananOptions = dummyJenisLayanan.filter((j) => j.apakah_aktif);

  const statCards = [
    { label: "Menunggu Verifikasi", value: countByStatus.menunggu, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-400 to-amber-600" },
    { label: "Dalam Proses", value: countByStatus.proses, icon: <FiLoader className="w-6 h-6" />, gradient: "from-blue-400 to-blue-600" },
    { label: "Selesai Hari Ini", value: countByStatus.selesai, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-green-400 to-green-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Verifikasi Pengajuan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Verifikasi Pengajuan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola dan verifikasi pengajuan mahasiswa</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DataTable */}
        <DataTable
          data={filtered}
          columns={columns}
          searchable
          searchKeys={["no_pengajuan", "nm_pemohon", "nm_layanan"]}
          searchPlaceholder="Cari no. pengajuan, pemohon, layanan..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap gap-3">
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[160px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                {verifikasiStatuses.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[180px]"
                value={filterLayanan}
                onChange={(e) => setFilterLayanan(e.target.value)}
              >
                <option value="">Semua Layanan</option>
                {layananOptions.map((l) => (
                  <option key={l.kode_layanan} value={l.kode_layanan}>{l.nm_layanan}</option>
                ))}
              </select>
            </div>
          }
        />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
