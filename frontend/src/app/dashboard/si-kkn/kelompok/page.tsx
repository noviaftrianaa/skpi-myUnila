"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip } from "@heroui/react";
import { FiUsers, FiMapPin, FiUser, FiPhone, FiHome } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import {
  dummyKelompokKkn,
  dummyAnggotaKelompok,
  dummyDplKelompok,
  dummyPamongDesa,
  dummyLokasiKkn,
} from "@/lib/services/si-kkn/dummyData";
import type { AnggotaKelompok } from "@/lib/services/si-kkn/types";

const statusChipColor: Record<string, "default" | "primary" | "success" | "danger"> = {
  dibentuk: "default",
  aktif: "primary",
  selesai: "success",
  dibatalkan: "danger",
};

const peranChipColor: Record<string, "primary" | "secondary" | "warning" | "default"> = {
  ketua: "primary",
  sekretaris: "secondary",
  bendahara: "warning",
  anggota: "default",
};

export default function KelompokSayaPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Simulate: user belongs to kelompok 1
  const myKelompok = dummyKelompokKkn[0];
  const myAnggota = dummyAnggotaKelompok.filter((a) => a.id_kelompok === myKelompok.id_kelompok);
  const myDpl = dummyDplKelompok.find((d) => d.id_kelompok === myKelompok.id_kelompok);
  const myPamong = dummyPamongDesa.find((p) => p.id_kelompok === myKelompok.id_kelompok);
  const myLokasi = dummyLokasiKkn.find((l) => l.id_lokasi === myKelompok.id_lokasi);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const anggotaColumns: Column<AnggotaKelompok>[] = [
    {
      key: "nama",
      label: "Nama",
      render: (item) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_mahasiswa}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.nm_prodi}</p>
        </div>
      ),
    },
    {
      key: "npm",
      label: "NPM",
      render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.npm}</span>,
    },
    {
      key: "prodi",
      label: "Program Studi",
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_prodi}</span>,
    },
    {
      key: "peran",
      label: "Peran",
      render: (item) => (
        <Chip size="sm" variant="flat" color={peranChipColor[item.peran] || "default"}>
          {item.peran.charAt(0).toUpperCase() + item.peran.slice(1)}
        </Chip>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Chip size="sm" variant="flat" color={item.status === "aktif" ? "success" : "danger"}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Chip>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Kelompok Saya"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Kelompok Saya</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Informasi kelompok KKN Anda</p>
        </div>

        {/* Kelompok Header Card */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <div className="p-5 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiUsers className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{myKelompok.kode_kelompok}</h3>
                  <p className="text-sm text-white/80">{myKelompok.nm_kelompok}</p>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-white/20 text-white border-none"
                >
                  {myKelompok.status.charAt(0).toUpperCase() + myKelompok.status.slice(1)}
                </Chip>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/70">Desa</p>
                  <p className="text-sm font-semibold">{myKelompok.nm_desa}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/70">Kecamatan</p>
                  <p className="text-sm font-semibold">{myKelompok.nm_kecamatan}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/70">Kabupaten</p>
                  <p className="text-sm font-semibold">{myKelompok.nm_kabupaten}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/70">Wilayah</p>
                  <p className="text-sm font-semibold">{myKelompok.nm_periode}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* DPL & Pamong Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DPL Info */}
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Dosen Pembimbing Lapangan (DPL)</h3>
              </div>
              {myDpl ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nama Dosen</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{myDpl.nm_dosen}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">NIDN</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{myDpl.nidn}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">No HP</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{myDpl.no_hp}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">DPL belum ditugaskan</p>
              )}
            </CardBody>
          </Card>

          {/* Pamong Info */}
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FiHome className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Pamong Desa</h3>
              </div>
              {myPamong ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nama Pamong</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{myPamong.nm_pamong}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Jabatan</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{myPamong.jabatan}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">No HP</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{myPamong.no_hp}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Pamong belum ditugaskan</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Anggota DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-violet-500" />
              Anggota Kelompok ({myAnggota.length} orang)
            </h3>
            <DataTable
              data={myAnggota}
              columns={anggotaColumns}
              searchable
              searchKeys={["nm_mahasiswa", "npm", "nm_prodi"]}
              searchPlaceholder="Cari anggota..."
              defaultRowsPerPage={10}
            />
          </CardBody>
        </Card>

        {/* Lokasi Detail */}
        {myLokasi && (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Detail Lokasi</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alamat Posko</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{myLokasi.alamat_posko}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kode Pos</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{myLokasi.kode_pos}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kuota Mahasiswa</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{myLokasi.kuota_mahasiswa} orang</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Koordinat</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {myLokasi.latitude}, {myLokasi.longitude}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desa</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{myLokasi.nm_desa}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kecamatan</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{myLokasi.nm_kecamatan}, {myLokasi.nm_kabupaten}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
