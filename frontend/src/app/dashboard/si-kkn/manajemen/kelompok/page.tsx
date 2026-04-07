"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiGrid, FiPlus, FiEye, FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import {
  dummyKelompokKkn,
  dummyAnggotaKelompok,
  dummyDplKelompok,
} from "@/lib/services/si-kkn/dummyData";
import type { KelompokKkn } from "@/lib/services/si-kkn/types";

const statusChipColor: Record<string, "default" | "primary" | "success" | "danger"> = {
  dibentuk: "default",
  aktif: "primary",
  selesai: "success",
  dibatalkan: "danger",
};

const statusLabel: Record<string, string> = {
  dibentuk: "Dibentuk",
  aktif: "Aktif",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function ManajemenKelompokPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("");
  const [showSlideOver, setShowSlideOver] = useState(false);

  const filtered = useMemo(() => {
    let data = [...dummyKelompokKkn];
    if (filterStatus) data = data.filter((k) => k.status === filterStatus);
    return data;
  }, [filterStatus]);

  const countByStatus = useMemo(() => ({
    total: dummyKelompokKkn.length,
    dibentuk: dummyKelompokKkn.filter((k) => k.status === "dibentuk").length,
    aktif: dummyKelompokKkn.filter((k) => k.status === "aktif").length,
    selesai: dummyKelompokKkn.filter((k) => k.status === "selesai").length,
  }), []);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<KelompokKkn>[] = [
    {
      key: "kode",
      label: "Kode Kelompok",
      render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.kode_kelompok}</span>,
    },
    {
      key: "lokasi",
      label: "Lokasi (Desa)",
      render: (item) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_desa}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.nm_kecamatan}, {item.nm_kabupaten}</p>
        </div>
      ),
    },
    {
      key: "wilayah",
      label: "Periode",
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_periode}</span>,
    },
    {
      key: "anggota",
      label: "Anggota",
      align: "center",
      render: (item) => {
        const lokasi = item.id_lokasi;
        return (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {item.jumlah_anggota}
          </span>
        );
      },
    },
    {
      key: "dpl",
      label: "DPL",
      render: (item) => {
        const dpl = dummyDplKelompok.find((d) => d.id_kelompok === item.id_kelompok);
        return dpl ? (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">{dpl.nm_dosen.split(",")[0]}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{dpl.nidn}</p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Belum ditugaskan</span>
        );
      },
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
        <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}>
          Detail
        </Button>
      ),
    },
  ];

  const statCards = [
    { label: "Total Kelompok", value: countByStatus.total, icon: <FiGrid className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Dibentuk", value: countByStatus.dibentuk, icon: <FiClock className="w-6 h-6" />, gradient: "from-gray-400 to-gray-600" },
    { label: "Aktif", value: countByStatus.aktif, icon: <FiUsers className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Selesai", value: countByStatus.selesai, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI KKN" appIcon={<MdDashboard className="w-6 h-6" />} appKey="e-kkn" fallbackMenus={siKknMenuConfig} pageTitle="Manajemen Kelompok">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Manajemen Kelompok</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola kelompok KKN dan anggotanya</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          searchKeys={["kode_kelompok", "nm_desa", "nm_kecamatan", "nm_kabupaten"]}
          searchPlaceholder="Cari kelompok, lokasi..."
          defaultRowsPerPage={10}
          actionSlot={
            <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
              Buat Kelompok
            </Button>
          }
          filterSlot={
            <div className="flex flex-wrap gap-3">
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[160px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="dibentuk">Dibentuk</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          }
        />

        {/* Slide-over Form */}
        {showSlideOver && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSlideOver(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Buat Kelompok Baru</h3>
                  <button onClick={() => setShowSlideOver(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kode Kelompok</label>
                    <input type="text" placeholder="KKN-2026-XXX" className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Kelompok</label>
                    <input type="text" placeholder="Kelompok X - Desa Y" className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
                    <textarea rows={3} placeholder="Catatan tambahan..." className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="flat" className="flex-1" onPress={() => setShowSlideOver(false)}>Batal</Button>
                    <Button color="primary" className="flex-1" onPress={() => setShowSlideOver(false)}>Simpan</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
