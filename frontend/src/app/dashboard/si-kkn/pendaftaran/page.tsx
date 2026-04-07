"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiCalendar, FiUsers, FiCheckCircle, FiXCircle, FiArrowRight, FiClipboard, FiClock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  dummyPeriodeKkn,
  dummyKriteriaPendaftaran,
  dummyRegistrasiKkn,
} from "@/lib/services/si-kkn/dummyData";

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

export default function PendaftaranKknPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  // Get active periode
  const activePeriode = dummyPeriodeKkn.find((p) => p.apakah_aktif);

  // Simulate: current user has an existing registration (use first "diajukan" record)
  const [hasRegistration] = useState(true);
  const myRegistration = dummyRegistrasiKkn.find((r) => r.status === "diajukan");

  // Simulated syarat values for user
  const syaratStatus = dummyKriteriaPendaftaran.map((kr) => ({
    ...kr,
    terpenuhi:
      kr.kode_kriteria === "MIN_SKS" ? true :
      kr.kode_kriteria === "MIN_IPK" ? true :
      kr.kode_kriteria === "LUNAS_UKT" ? true :
      kr.kode_kriteria === "MIN_SEMESTER" ? true :
      kr.kode_kriteria === "MAX_SEMESTER" ? true :
      kr.kode_kriteria === "STATUS_AKTIF" ? true : false,
  }));

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Pendaftaran KKN"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pendaftaran KKN</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daftarkan diri untuk mengikuti Kuliah Kerja Nyata</p>
        </div>

        {/* Active Periode Info */}
        {activePeriode && (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiCalendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Periode Aktif</h3>
                    <p className="text-sm text-white/80">{activePeriode.nm_periode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70">Mulai Daftar</p>
                    <p className="text-sm font-semibold">{new Date(activePeriode.tgl_mulai_daftar).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70">Batas Daftar</p>
                    <p className="text-sm font-semibold">{new Date(activePeriode.tgl_selesai_daftar).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70">Kuota Peserta</p>
                    <p className="text-sm font-semibold">{activePeriode.kuota_peserta} mahasiswa</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70">Tahun Akademik</p>
                    <p className="text-sm font-semibold">{activePeriode.tahun_akademik} ({activePeriode.semester})</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Registration Status or Register Button */}
        {hasRegistration && myRegistration ? (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FiClipboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Status Pendaftaran Anda</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Anda sudah terdaftar pada periode ini</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">No. Registrasi</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{myRegistration.id_registrasi.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <Chip size="sm" variant="flat" color={statusChipColor[myRegistration.status] || "default"}>
                    {statusLabel[myRegistration.status] || myRegistration.status}
                  </Chip>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Daftar</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {myRegistration.tgl_daftar
                      ? new Date(myRegistration.tgl_daftar).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                <FiClipboard className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Belum Terdaftar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Anda belum mendaftar KKN periode ini. Pastikan semua syarat terpenuhi sebelum mendaftar.</p>
              </div>
              <Button
                color="primary"
                size="lg"
                endContent={<FiArrowRight className="w-4 h-4" />}
                onPress={() => router.push("/dashboard/si-kkn/pendaftaran/daftar")}
              >
                Daftar KKN Sekarang
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Syarat Pendaftaran */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Syarat Pendaftaran</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pastikan semua syarat berikut terpenuhi</p>
              </div>
            </div>
            <div className="space-y-3">
              {syaratStatus.map((syarat) => (
                <div
                  key={syarat.id_kriteria}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  {syarat.terpenuhi ? (
                    <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{syarat.nm_kriteria}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{syarat.deskripsi}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Min: {syarat.nilai_minimum}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
