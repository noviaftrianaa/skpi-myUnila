"use client";

import { useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiDownload, FiFile, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { dummyPengajuan, dummyRiwayat, dummyDokumen } from "@/lib/services/sim-bak/dummyData";
import type { StatusPengajuan } from "@/lib/services/sim-bak/types";

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

// Determine timeline step state relative to current status
const statusOrder: StatusPengajuan[] = [
  "draft",
  "diajukan",
  "perlu_perbaikan",
  "diverifikasi",
  "menunggu_persetujuan",
  "disetujui",
  "ditolak",
  "terbit",
];

const verifikasiColorMap: Record<string, "default" | "success" | "danger"> = {
  belum_dicek: "default",
  valid: "success",
  tidak_valid: "danger",
};

const verifikasiLabelMap: Record<string, string> = {
  belum_dicek: "Belum Dicek",
  valid: "Valid",
  tidak_valid: "Tidak Valid",
};

export default function DetailPengajuanPage() {
  useRequireAuth();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const pengajuan = useMemo(
    () => dummyPengajuan.find((p) => p.id_pengajuan === id),
    [id]
  );

  const riwayat = useMemo(
    () =>
      dummyRiwayat
        .filter((r) => r.id_pengajuan === id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [id]
  );

  const dokumen = useMemo(
    () => dummyDokumen.filter((d) => d.id_pengajuan === id),
    [id]
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="SI MBAK"
        appIcon={<MdDashboard className="w-6 h-6" />}
        appKey="sim-bak"
        fallbackMenus={simBakMenuConfig}
        pageTitle="Pengajuan Tidak Ditemukan"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Pengajuan dengan ID <span className="font-mono font-bold">{id}</span> tidak ditemukan.
          </p>
          <Button
            className="mt-4"
            variant="flat"
            color="primary"
            onPress={() => router.push("/dashboard/sim-bak/riwayat")}
          >
            Kembali ke Riwayat
          </Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const pemohon = pengajuan.data_pemohon;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle={`Detail ${pengajuan.no_pengajuan}`}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="light"
          startContent={<FiArrowLeft className="w-4 h-4" />}
          onPress={() => router.push("/dashboard/sim-bak/riwayat")}
          className="text-gray-600 dark:text-gray-400"
        >
          Kembali ke Riwayat
        </Button>

        {/* Header Card */}
        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No. Pengajuan</p>
                <h1 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {pengajuan.no_pengajuan}
                </h1>
              </div>
              <Chip
                color={statusColorMap[pengajuan.status]}
                variant="flat"
                size="lg"
              >
                {statusLabelMap[pengajuan.status]}
              </Chip>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jenis Layanan</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                  {pengajuan.nm_layanan}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Pengajuan</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                  {pengajuan.tgl_pengajuan
                    ? new Date(pengajuan.tgl_pengajuan).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Selesai</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                  {pengajuan.tgl_selesai
                    ? new Date(pengajuan.tgl_selesai).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kode Layanan</p>
                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white mt-0.5">
                  {pengajuan.kode_layanan}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Pemohon */}
        {pemohon && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Pemohon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", value: pemohon.nm_lengkap },
                  { label: "NPM", value: pemohon.npm || "-" },
                  { label: "Program Studi", value: pemohon.nm_prodi || "-" },
                  { label: "Fakultas", value: pemohon.nm_fakultas || "-" },
                  { label: "Semester", value: pemohon.semester?.toString() || "-" },
                  { label: "IPK", value: pemohon.ipk?.toFixed(2) || "-" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Timeline Riwayat Status */}
        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Riwayat Status
            </h2>
            {riwayat.length > 0 ? (
              <div className="relative">
                {riwayat.map((entry, idx) => {
                  const isLast = idx === riwayat.length - 1;
                  const isCurrent = isLast;
                  const isCompleted = !isLast;

                  // Determine dot and line colors
                  const dotColor = isCompleted
                    ? "bg-green-500 border-green-500"
                    : isCurrent
                    ? "bg-blue-500 border-blue-500"
                    : "bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600";

                  const lineColor = isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600";

                  const DotIcon = isCompleted
                    ? FiCheckCircle
                    : isCurrent
                    ? FiClock
                    : FiAlertCircle;

                  return (
                    <div key={entry.id_riwayat} className="flex gap-4 pb-6 last:pb-0">
                      {/* Timeline dot & line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${dotColor}`}
                        >
                          <DotIcon className="w-4 h-4 text-white" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 mt-1 ${lineColor}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Chip
                            color={statusColorMap[entry.status_ke as StatusPengajuan] || "default"}
                            variant="flat"
                            size="sm"
                          >
                            {statusLabelMap[entry.status_ke as StatusPengajuan] || entry.status_ke}
                          </Chip>
                          {entry.status_dari && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              dari {statusLabelMap[entry.status_dari as StatusPengajuan] || entry.status_dari}
                            </span>
                          )}
                        </div>
                        {entry.catatan && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {entry.catatan}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.nm_aktor}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            {new Date(entry.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada riwayat status untuk pengajuan ini.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Dokumen */}
        {dokumen.length > 0 && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dokumen
              </h2>
              <div className="space-y-3">
                {dokumen.map((doc) => (
                  <div
                    key={doc.id_dokumen}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.nm_file}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.kode_dokumen} &middot; {(doc.ukuran_byte / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <Chip
                      color={verifikasiColorMap[doc.status_verifikasi]}
                      variant="flat"
                      size="sm"
                    >
                      {verifikasiLabelMap[doc.status_verifikasi]}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Download Surat - only if status is terbit */}
        {pengajuan.status === "terbit" && (
          <Card className="shadow-md rounded-xl border-2 border-green-200 dark:border-green-800">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Surat Telah Terbit
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Surat {pengajuan.nm_layanan} Anda sudah dapat diunduh.
                  </p>
                </div>
                <Button
                  color="success"
                  startContent={<FiDownload className="w-4 h-4" />}
                  onPress={() => {
                    // In production, this would trigger a download
                    window.alert("Download surat (demo)");
                  }}
                >
                  Download Surat
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
