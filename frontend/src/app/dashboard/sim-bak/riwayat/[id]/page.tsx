"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiDownload, FiFile, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { getPengajuanDetail } from "@/lib/services/sim-bak/simBakService";
import type { StatusPengajuan } from "@/lib/services/sim-bak/types";

const statusColorMap: Record<StatusPengajuan, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabelMap: Record<StatusPengajuan, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function DetailPengajuanPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    getPengajuanDetail(id)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (error || !detail) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Detail Pengajuan">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FiAlertCircle className="w-12 h-12 mb-3" />
          <p className="text-lg font-medium">Pengajuan tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/riwayat")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const status = detail.status as StatusPengajuan;
  const pemohon = detail.data_pemohon as Record<string, unknown> | null;
  const riwayat = (detail.riwayat as Array<Record<string, unknown>>) ?? [];
  const dokumen = (detail.dokumen as Array<Record<string, unknown>>) ?? [];
  const dokumenHasil = (detail.dokumen_hasil as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Detail ${detail.nomor_permohonan}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="light" startContent={<FiArrowLeft className="w-4 h-4" />} onPress={() => router.push("/dashboard/sim-bak/riwayat")} className="text-gray-600 dark:text-gray-400">
          Kembali ke Riwayat
        </Button>

        {/* Header */}
        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No. Pengajuan</p>
                <h1 className="text-xl font-bold font-mono text-gray-900 dark:text-white">{detail.nomor_permohonan as string}</h1>
              </div>
              <Chip color={statusColorMap[status] || "default"} variant="flat" size="lg">{statusLabelMap[status] || status}</Chip>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              {[
                { label: "Jenis Layanan", value: detail.nm_layanan as string },
                { label: "Tanggal Pengajuan", value: detail.tgl_diajukan ? new Date(detail.tgl_diajukan as string).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"}) : "-" },
                { label: "Tanggal Selesai", value: detail.tgl_selesai ? new Date(detail.tgl_selesai as string).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"}) : "-" },
                { label: "Kode", value: detail.kode_layanan as string },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Data Pemohon */}
        {pemohon && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Pemohon</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", value: pemohon.nm_mahasiswa },
                  { label: "NIM", value: pemohon.nim },
                  { label: "Program Studi", value: pemohon.nm_prodi },
                  { label: "Fakultas", value: pemohon.nm_fakultas },
                  { label: "Semester", value: pemohon.semester_aktif },
                  { label: "IPK", value: pemohon.ipk ? Number(pemohon.ipk).toFixed(2) : "-" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{String(item.value ?? "-")}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Timeline Riwayat */}
        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Riwayat Status</h2>
            {riwayat.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat.</p>
            ) : (
              <div className="relative">
                {riwayat.map((entry, idx) => {
                  const isLast = idx === riwayat.length - 1;
                  const Icon = isLast ? FiClock : FiCheckCircle;
                  return (
                    <div key={String(entry.id_riwayat)} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isLast ? "bg-blue-500 border-blue-500" : "bg-green-500 border-green-500"}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 mt-1 bg-green-500" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Chip color={statusColorMap[entry.status_ke as StatusPengajuan] || "default"} variant="flat" size="sm">
                            {statusLabelMap[entry.status_ke as StatusPengajuan] || String(entry.status_ke)}
                          </Chip>
                          {entry.kode_role_aktor && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{String(entry.kode_role_aktor)}</span>}
                        </div>
                        {entry.catatan && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{String(entry.catatan)}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{String(entry.nm_aktor || "-")}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {entry.created_at ? new Date(String(entry.created_at)).toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Dokumen Persyaratan */}
        {dokumen.length > 0 && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dokumen Persyaratan</h2>
              <div className="space-y-3">
                {dokumen.map(doc => (
                  <div key={String(doc.id_dokumen)} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{String(doc.nm_dokumen)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{String(doc.nama_file_asli)} · {doc.ukuran_byte ? `${Math.round(Number(doc.ukuran_byte)/1024)} KB` : ""}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Dokumen Hasil — show download button */}
        {status === "terbit" && (
          <Card className="shadow-md rounded-xl border-2 border-green-200 dark:border-green-800">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Surat Telah Terbit</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {detail.nomor_dokumen_hasil ? `No. ${detail.nomor_dokumen_hasil}` : "Surat sudah dapat diunduh"}
                  </p>
                </div>
                <Button color="success" startContent={<FiDownload className="w-4 h-4" />}
                  onPress={() => dokumenHasil[0] && window.open(String(dokumenHasil[0].path_file), "_blank")}>
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
