"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button, Textarea } from "@heroui/react";
import { FiClock, FiCheckCircle, FiXCircle, FiEye, FiCheck, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { addToast } from "@heroui/react";
import {
  dummyRegistrasiKkn,
  dummyVerifikasiSyarat,
  dummyWilayahKkn,
} from "@/lib/services/si-kkn/dummyData";
import type { RegistrasiKkn } from "@/lib/services/si-kkn/types";

const statusChipColor: Record<string, "default" | "primary" | "success" | "danger" | "warning"> = {
  draft: "default",
  diajukan: "primary",
  diterima: "success",
  ditolak: "danger",
  mengundurkan_diri: "warning",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  diterima: "Diterima",
  ditolak: "Ditolak",
  mengundurkan_diri: "Mengundurkan Diri",
};

export default function VerifikasiPendaftaranPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedRegistrasi, setSelectedRegistrasi] = useState<RegistrasiKkn | null>(null);
  const [catatan, setCatatan] = useState("");

  const filtered = useMemo(() => {
    let data = [...dummyRegistrasiKkn];
    if (filterStatus) data = data.filter((r) => r.status === filterStatus);
    return data;
  }, [filterStatus]);

  const countByStatus = useMemo(() => ({
    menunggu: dummyRegistrasiKkn.filter((r) => r.status === "diajukan").length,
    diterima: dummyRegistrasiKkn.filter((r) => r.status === "diterima").length,
    ditolak: dummyRegistrasiKkn.filter((r) => r.status === "ditolak").length,
  }), []);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const handleAction = (registrasi: RegistrasiKkn, action: "terima" | "tolak") => {
    addToast({
      title: action === "terima" ? "Pendaftaran Diterima" : "Pendaftaran Ditolak",
      description: `Pendaftaran ${registrasi.nm_mahasiswa} telah ${action === "terima" ? "diterima" : "ditolak"}.`,
      color: action === "terima" ? "success" : "danger",
    });
    setSelectedRegistrasi(null);
    setCatatan("");
  };

  const columns: Column<RegistrasiKkn>[] = [
    {
      key: "no_reg",
      label: "No. Registrasi",
      render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.id_registrasi.toUpperCase()}</span>,
    },
    {
      key: "pemohon",
      label: "Pemohon",
      render: (item) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_mahasiswa}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.npm}</p>
        </div>
      ),
    },
    {
      key: "prodi",
      label: "Prodi / Fakultas",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{item.nm_prodi}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.nm_fakultas}</p>
        </div>
      ),
    },
    {
      key: "wilayah",
      label: "Pilihan Wilayah",
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_periode}</span>,
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
      key: "syarat",
      label: "Syarat",
      align: "center",
      render: (item) => {
        const syaratList = dummyVerifikasiSyarat.filter((v) => v.id_registrasi === item.id_registrasi);
        const terpenuhi = syaratList.filter((v) => v.apakah_terpenuhi).length;
        const total = syaratList.length;
        return total > 0 ? (
          <Chip size="sm" variant="flat" color={terpenuhi === total ? "success" : "warning"}>
            {terpenuhi}/{total}
          </Chip>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        );
      },
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<FiEye className="w-3.5 h-3.5" />}
            onPress={() => setSelectedRegistrasi(item)}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  const statCards = [
    { label: "Menunggu Verifikasi", value: countByStatus.menunggu, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-400 to-amber-600" },
    { label: "Diterima", value: countByStatus.diterima, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-400 to-emerald-600" },
    { label: "Ditolak", value: countByStatus.ditolak, icon: <FiXCircle className="w-6 h-6" />, gradient: "from-red-400 to-red-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI KKN" appIcon={<MdDashboard className="w-6 h-6" />} appKey="e-kkn" fallbackMenus={siKknMenuConfig} pageTitle="Verifikasi Pendaftaran">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Verifikasi Pendaftaran</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verifikasi dan kelola pendaftaran KKN mahasiswa</p>
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
          searchKeys={["id_registrasi", "nm_mahasiswa", "npm", "nm_prodi", "nm_fakultas"]}
          searchPlaceholder="Cari registrasi, nama, NPM, prodi..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap gap-3">
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-w-[160px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="diajukan">Diajukan</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
                <option value="mengundurkan_diri">Mengundurkan Diri</option>
              </select>
            </div>
          }
        />

        {/* Detail Slide-over */}
        {selectedRegistrasi && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedRegistrasi(null)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Pendaftaran</h3>
                  <button onClick={() => setSelectedRegistrasi(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
                </div>

                {/* Pemohon Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nama</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.nm_mahasiswa}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">NPM</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.npm}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Program Studi</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.nm_prodi}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fakultas</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.nm_fakultas}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">IPK</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.ipk}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Semester</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.semester}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total SKS</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRegistrasi.total_sks}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <Chip size="sm" variant="flat" color={statusChipColor[selectedRegistrasi.status] || "default"}>
                        {statusLabel[selectedRegistrasi.status] || selectedRegistrasi.status}
                      </Chip>
                    </div>
                  </div>

                  {/* Syarat Verification */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Verifikasi Syarat</h4>
                    <div className="space-y-2">
                      {dummyVerifikasiSyarat
                        .filter((v) => v.id_registrasi === selectedRegistrasi.id_registrasi)
                        .map((v) => (
                          <div
                            key={v.id_verifikasi}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                              v.apakah_terpenuhi
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {v.apakah_terpenuhi ? <FiCheck className="w-4 h-4 flex-shrink-0" /> : <FiX className="w-4 h-4 flex-shrink-0" />}
                            <span className="flex-1">{v.nm_kriteria}</span>
                            <span className="font-mono text-xs">{v.nilai_aktual === "true" ? "Ya" : v.nilai_aktual}</span>
                          </div>
                        ))}
                      {dummyVerifikasiSyarat.filter((v) => v.id_registrasi === selectedRegistrasi.id_registrasi).length === 0 && (
                        <p className="text-xs text-gray-400">Belum diverifikasi</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedRegistrasi.status === "diajukan" && (
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Textarea
                        label="Catatan Verifikasi"
                        placeholder="Tuliskan catatan atau alasan..."
                        value={catatan}
                        onValueChange={setCatatan}
                        minRows={2}
                      />
                      <div className="flex gap-3">
                        <Button
                          color="danger"
                          variant="flat"
                          className="flex-1"
                          startContent={<FiX className="w-4 h-4" />}
                          onPress={() => handleAction(selectedRegistrasi, "tolak")}
                        >
                          Tolak
                        </Button>
                        <Button
                          color="success"
                          className="flex-1"
                          startContent={<FiCheck className="w-4 h-4" />}
                          onPress={() => handleAction(selectedRegistrasi, "terima")}
                        >
                          Terima
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
