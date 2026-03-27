"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiMapPin, FiArrowRight, FiUsers, FiCheck } from "react-icons/fi";
import { addToast } from "@heroui/react";
import {
  dummyKelompokKkn,
  dummyLokasiKkn,
  dummyWilayahKkn,
} from "@/lib/services/si-kkn/dummyData";

export default function PenempatanPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  // Kelompok without locations (simulate: kelompok with status "dibentuk")
  const unassignedKelompok = dummyKelompokKkn.filter((k) => k.status === "dibentuk");
  const assignedKelompok = dummyKelompokKkn.filter((k) => k.status !== "dibentuk");

  // Available locations
  const availableLokasi = dummyLokasiKkn.filter((l) => l.apakah_aktif);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const handleAssign = (kelompokId: string, lokasiId: string) => {
    setAssignments((prev) => ({ ...prev, [kelompokId]: lokasiId }));
    const lokasi = dummyLokasiKkn.find((l) => l.id_lokasi === lokasiId);
    const kelompok = dummyKelompokKkn.find((k) => k.id_kelompok === kelompokId);
    addToast({
      title: "Penempatan Berhasil",
      description: `${kelompok?.kode_kelompok} ditempatkan di ${lokasi?.nm_desa}`,
      color: "success",
    });
  };

  return (
    <DashboardLayoutWithDynamicMenu appName="SI KKN" appIcon={<MdDashboard className="w-6 h-6" />} appKey="e-kkn" fallbackMenus={siKknMenuConfig} pageTitle="Penempatan Kelompok">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Penempatan Kelompok</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Atur penempatan kelompok KKN ke lokasi desa</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Belum Ditempatkan</p>
                <p className="text-3xl font-bold mt-1">{unassignedKelompok.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Sudah Ditempatkan</p>
                <p className="text-3xl font-bold mt-1">{assignedKelompok.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCheck className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Lokasi Tersedia</p>
                <p className="text-3xl font-bold mt-1">{availableLokasi.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiMapPin className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Unassigned Kelompok */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Kelompok Belum Ditempatkan</h3>
            {unassignedKelompok.length === 0 ? (
              <Card className="border-none shadow-lg rounded-xl overflow-hidden">
                <CardBody className="p-5 text-center">
                  <FiCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Semua kelompok sudah ditempatkan</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {unassignedKelompok.map((kel) => (
                  <Card key={kel.id_kelompok} className="border-none shadow-lg rounded-xl overflow-hidden">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{kel.kode_kelompok}</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{kel.nm_kelompok}</p>
                        </div>
                        <Chip size="sm" variant="flat" color="default">
                          {kel.jumlah_anggota} anggota
                        </Chip>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pilih Lokasi</label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            value={assignments[kel.id_kelompok] || ""}
                            onChange={(e) => setAssignments((prev) => ({ ...prev, [kel.id_kelompok]: e.target.value }))}
                          >
                            <option value="">-- Pilih Lokasi --</option>
                            {availableLokasi.map((lok) => (
                              <option key={lok.id_lokasi} value={lok.id_lokasi}>
                                {lok.nm_desa} - {lok.nm_kecamatan} (kuota: {lok.kuota_mahasiswa})
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            color="primary"
                            isDisabled={!assignments[kel.id_kelompok]}
                            onPress={() => handleAssign(kel.id_kelompok, assignments[kel.id_kelompok])}
                          >
                            <FiArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Available Lokasi */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Lokasi Tersedia</h3>
            <div className="space-y-3">
              {availableLokasi.map((lok) => {
                const wilayah = dummyWilayahKkn.find((w) => w.id_wilayah === lok.id_wilayah);
                const assignedHere = dummyKelompokKkn.filter((k) => k.id_lokasi === lok.id_lokasi && k.status !== "dibentuk");
                return (
                  <Card key={lok.id_lokasi} className="border-none shadow-lg rounded-xl overflow-hidden">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{lok.nm_desa}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{lok.nm_kecamatan}, {lok.nm_kabupaten}</p>
                          {wilayah && <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{wilayah.nm_wilayah}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Kuota</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{lok.kuota_mahasiswa}</p>
                        </div>
                      </div>
                      {assignedHere.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {assignedHere.map((k) => (
                            <Chip key={k.id_kelompok} size="sm" variant="flat" color="primary">
                              {k.kode_kelompok}
                            </Chip>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {lok.alamat_posko}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
