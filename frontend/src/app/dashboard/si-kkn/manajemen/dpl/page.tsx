"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiUser, FiPlus, FiPhone } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import {
  dummyDplKelompok,
  dummyKelompokKkn,
} from "@/lib/services/si-kkn/dummyData";
import type { DplKelompok } from "@/lib/services/si-kkn/types";

export default function ManajemenDplPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [selectedDpl, setSelectedDpl] = useState<string | null>(null);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<DplKelompok>[] = [
    {
      key: "nama",
      label: "Nama Dosen",
      render: (item) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_dosen}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.nm_prodi} - {item.nm_fakultas}</p>
        </div>
      ),
    },
    {
      key: "nidn",
      label: "NIDN",
      render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.nidn}</span>,
    },
    {
      key: "kelompok",
      label: "Kelompok",
      render: (item) => {
        const kel = dummyKelompokKkn.find((k) => k.id_kelompok === item.id_kelompok);
        return kel ? (
          <Chip size="sm" variant="flat" color="primary">{kel.kode_kelompok}</Chip>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        );
      },
    },
    {
      key: "no_hp",
      label: "No HP",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <FiPhone className="w-3 h-3 text-gray-400" />
          {item.no_hp}
        </span>
      ),
    },
    {
      key: "peran",
      label: "Peran",
      render: () => (
        <Chip size="sm" variant="flat" color="secondary">DPL</Chip>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const kel = dummyKelompokKkn.find((k) => k.id_kelompok === item.id_kelompok);
        return (
          <Chip size="sm" variant="flat" color={kel?.status === "aktif" ? "success" : kel?.status === "selesai" ? "default" : "warning"}>
            {kel?.status === "aktif" ? "Aktif" : kel?.status === "selesai" ? "Selesai" : "Menunggu"}
          </Chip>
        );
      },
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
          onPress={() => {
            setSelectedDpl(item.id_dpl);
            setShowSlideOver(true);
          }}
        >
          Assign
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI KKN" appIcon={<MdDashboard className="w-6 h-6" />} appKey="e-kkn" fallbackMenus={siKknMenuConfig} pageTitle="Manajemen DPL">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Manajemen DPL</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola Dosen Pembimbing Lapangan dan penugasannya</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total DPL</p>
                <p className="text-3xl font-bold mt-1">{dummyDplKelompok.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Sudah Ditugaskan</p>
                <p className="text-3xl font-bold mt-1">{dummyDplKelompok.filter((d) => d.id_kelompok).length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Kelompok Aktif</p>
                <p className="text-3xl font-bold mt-1">{dummyKelompokKkn.filter((k) => k.status === "aktif").length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={dummyDplKelompok}
          columns={columns}
          searchable
          searchKeys={["nm_dosen", "nidn", "nm_prodi"]}
          searchPlaceholder="Cari dosen, NIDN, prodi..."
          defaultRowsPerPage={10}
          actionSlot={
            <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
              Assign DPL
            </Button>
          }
        />

        {/* Slide-over Form */}
        {showSlideOver && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSlideOver(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign DPL ke Kelompok</h3>
                  <button onClick={() => setShowSlideOver(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dosen (DPL)</label>
                    <select
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value={selectedDpl || ""}
                      onChange={(e) => setSelectedDpl(e.target.value)}
                    >
                      <option value="">-- Pilih Dosen --</option>
                      {dummyDplKelompok.map((d) => (
                        <option key={d.id_dpl} value={d.id_dpl}>{d.nm_dosen} ({d.nidn})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kelompok</label>
                    <select className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <option value="">-- Pilih Kelompok --</option>
                      {dummyKelompokKkn.map((k) => (
                        <option key={k.id_kelompok} value={k.id_kelompok}>{k.kode_kelompok} - {k.nm_desa}</option>
                      ))}
                    </select>
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
