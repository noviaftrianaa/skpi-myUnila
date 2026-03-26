"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button, Select, SelectItem } from "@heroui/react";
import { FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { dummyPengajuan, dummyJenisLayanan } from "@/lib/services/sim-bak/dummyData";
import type { Pengajuan, StatusPengajuan } from "@/lib/services/sim-bak/types";

const statusColorMap: Record<StatusPengajuan, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  draft: "default",
  diajukan: "primary",
  perlu_perbaikan: "warning",
  diverifikasi: "secondary",
  menunggu_persetujuan: "warning",
  disetujui: "success",
  ditolak: "danger",
  terbit: "success",
};

const statusLabelMap: Record<StatusPengajuan, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  perlu_perbaikan: "Perlu Perbaikan",
  diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  terbit: "Terbit",
};

const allStatuses: StatusPengajuan[] = [
  "draft",
  "diajukan",
  "perlu_perbaikan",
  "diverifikasi",
  "menunggu_persetujuan",
  "disetujui",
  "ditolak",
  "terbit",
];

export default function RiwayatPengajuanPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterLayanan, setFilterLayanan] = useState<string>("");

  const filteredData = useMemo(() => {
    let data = [...dummyPengajuan];
    if (filterStatus) {
      data = data.filter((p) => p.status === filterStatus);
    }
    if (filterLayanan) {
      data = data.filter((p) => p.kode_layanan === filterLayanan);
    }
    return data;
  }, [filterStatus, filterLayanan]);

  const layananOptions = useMemo(
    () =>
      dummyJenisLayanan.filter(
        (j) => j.kategori === "surat_mandiri" || j.kategori === "permohonan_akademik"
      ),
    []
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns: Column<Pengajuan>[] = [
    {
      key: "no_pengajuan",
      label: "No. Pengajuan",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          {item.no_pengajuan}
        </span>
      ),
    },
    {
      key: "nm_layanan",
      label: "Jenis Layanan",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {item.nm_layanan}
        </span>
      ),
    },
    {
      key: "tgl_pengajuan",
      label: "Tanggal Pengajuan",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.tgl_pengajuan
            ? new Date(item.tgl_pengajuan).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => (
        <Chip
          color={statusColorMap[item.status]}
          variant="flat"
          size="sm"
        >
          {statusLabelMap[item.status]}
        </Chip>
      ),
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
          startContent={<FiEye className="w-3.5 h-3.5" />}
          onPress={() => router.push(`/dashboard/sim-bak/riwayat/${item.id_pengajuan}`)}
        >
          Lihat
        </Button>
      ),
    },
  ];

  const filterSlot = (
    <div className="flex flex-wrap gap-3">
      <Select
        size="sm"
        label="Status"
        className="w-48"
        selectedKeys={filterStatus ? [filterStatus] : []}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        {allStatuses.map((s) => (
          <SelectItem key={s} textValue={statusLabelMap[s]}>
            {statusLabelMap[s]}
          </SelectItem>
        ))}
      </Select>
      <Select
        size="sm"
        label="Jenis Layanan"
        className="w-56"
        selectedKeys={filterLayanan ? [filterLayanan] : []}
        onChange={(e) => setFilterLayanan(e.target.value)}
      >
        {layananOptions.map((l) => (
          <SelectItem key={l.kode_layanan} textValue={l.nm_layanan}>
            {l.nm_layanan}
          </SelectItem>
        ))}
      </Select>
      {(filterStatus || filterLayanan) && (
        <Button
          size="sm"
          variant="flat"
          onPress={() => {
            setFilterStatus("");
            setFilterLayanan("");
          }}
        >
          Reset Filter
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Riwayat Pengajuan"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Riwayat Pengajuan
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pantau status dan progres semua pengajuan Anda
          </p>
        </div>

        <DataTable
          data={filteredData}
          columns={columns}
          searchable
          searchKeys={["no_pengajuan"]}
          searchPlaceholder="Cari no. pengajuan..."
          filterSlot={filterSlot}
          defaultRowsPerPage={10}
        />
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
