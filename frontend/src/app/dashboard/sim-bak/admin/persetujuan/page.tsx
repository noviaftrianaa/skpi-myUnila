"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyPengajuan, dummyJenisLayanan, dummyPersetujuan } from "@/lib/services/sim-bak/dummyData";
import type { Pengajuan } from "@/lib/services/sim-bak/types";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function PersetujuanPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("");

  const permohonanLayananIds = dummyJenisLayanan
    .filter((j) => j.kategori === "permohonan_akademik")
    .map((j) => j.id_jenis_layanan);

  const filtered = useMemo(() => {
    let data = dummyPengajuan.filter((p) => permohonanLayananIds.includes(p.id_jenis_layanan));
    if (filterStatus) data = data.filter((p) => p.status === filterStatus);
    return data;
  }, [filterStatus]);

  const getApprovalStep = (pengajuanId: string): string => {
    const approvals = dummyPersetujuan.filter((a) => a.id_pengajuan === pengajuanId);
    if (approvals.length === 0) return "Belum ada approval";
    const pending = approvals.find((a) => a.status === "menunggu");
    if (pending) return `Menunggu: ${pending.role_penyetuju}`;
    const rejected = approvals.find((a) => a.status === "ditolak");
    if (rejected) return `Ditolak: ${rejected.role_penyetuju}`;
    return "Semua disetujui";
  };

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
      key: "jenis",
      label: "Jenis Permohonan",
      render: (item) => <span className="text-sm">{item.nm_layanan}</span>,
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
      key: "tahap_approval",
      label: "Tahap Approval",
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{getApprovalStep(item.id_pengajuan)}</span>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
          onPress={() => router.push(`/dashboard/sim-bak/admin/persetujuan/${item.id_pengajuan}`)}>
          Lihat
        </Button>
      ),
    },
  ];

  const statusOptions = ["menunggu_persetujuan", "disetujui", "ditolak", "diverifikasi"];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Persetujuan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Persetujuan Permohonan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola persetujuan permohonan akademik mahasiswa</p>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          searchable
          searchKeys={["no_pengajuan", "nm_pemohon", "nm_layanan"]}
          searchPlaceholder="Cari no. pengajuan, pemohon..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap gap-3">
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[180px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>
          }
        />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
