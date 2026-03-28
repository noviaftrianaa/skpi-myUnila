"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiAlertTriangle, FiFileText, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { dummyPengajuan, dummyDokumen, dummyRiwayat } from "@/lib/services/sim-bak/dummyData";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

const verifikasiLabel: Record<string, string> = {
  belum_dicek: "Belum Dicek",
  valid: "Valid",
  tidak_valid: "Tidak Valid",
};

export default function VerifikasiDetailPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const pengajuan = dummyPengajuan.find((p) => p.id_pengajuan === id);
  const dokumen = dummyDokumen.filter((d) => d.id_pengajuan === id);
  const riwayat = dummyRiwayat.filter((r) => r.id_pengajuan === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // If no docs found for this id, show sample docs from peng-001
  const displayDokumen = dokumen.length > 0 ? dokumen : dummyDokumen.filter((d) => d.id_pengajuan === "peng-001");
  const displayRiwayat = riwayat.length > 0 ? riwayat : dummyRiwayat.filter((r) => r.id_pengajuan === "peng-001").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const [docStates, setDocStates] = useState<Record<string, { status: string; catatan: string }>>(
    Object.fromEntries(displayDokumen.map((d) => [d.id_dokumen, { status: d.status_verifikasi, catatan: d.catatan_verifikasi || "" }]))
  );

  const updateDocStatus = (docId: string, status: string) => {
    setDocStates((prev) => ({ ...prev, [docId]: { ...prev[docId], status } }));
  };

  const updateDocCatatan = (docId: string, catatan: string) => {
    setDocStates((prev) => ({ ...prev, [docId]: { ...prev[docId], catatan } }));
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!pengajuan) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Verifikasi Detail">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Pengajuan tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/admin/verifikasi")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const pemohon = pengajuan.data_pemohon;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Verifikasi — ${pengajuan.no_pengajuan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/admin/verifikasi")}>
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Verifikasi Pengajuan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pengajuan.no_pengajuan} &middot; {pengajuan.nm_layanan}</p>
          </div>
          <Chip size="sm" variant="flat" color={statusChipColor[pengajuan.status] || "default"}>
            {statusLabel[pengajuan.status] || pengajuan.status}
          </Chip>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Pemohon */}
            <Card className="shadow-md rounded-xl border-none">
              <CardBody className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiUser className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pemohon</h2>
                </div>
                {pemohon && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.nm_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">NPM</p>
                      <p className="font-medium font-mono text-gray-900 dark:text-white">{pemohon.npm}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Program Studi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.nm_prodi}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Fakultas</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.nm_fakultas}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Semester</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.semester}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">IPK</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.ipk}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">No. HP</p>
                      <p className="font-medium text-gray-900 dark:text-white">{pemohon.no_hp}</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Dokumen Review */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dokumen Review</h2>
              </div>
              <div className="space-y-4">
                {displayDokumen.map((doc) => {
                  const state = docStates[doc.id_dokumen] || { status: doc.status_verifikasi, catatan: "" };
                  return (
                    <Card key={doc.id_dokumen} className="shadow-sm rounded-xl border-none">
                      <CardBody className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{doc.nm_file}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {doc.kode_dokumen} &middot; {(doc.ukuran_byte / 1024).toFixed(0)} KB &middot; {doc.tipe_file.split("/").pop()?.toUpperCase()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={state.status === "valid" ? "solid" : "bordered"}
                              color="success"
                              onPress={() => updateDocStatus(doc.id_dokumen, "valid")}
                            >
                              <FiCheck className="w-3.5 h-3.5 mr-1" /> Valid
                            </Button>
                            <Button
                              size="sm"
                              variant={state.status === "tidak_valid" ? "solid" : "bordered"}
                              color="danger"
                              onPress={() => updateDocStatus(doc.id_dokumen, "tidak_valid")}
                            >
                              <FiX className="w-3.5 h-3.5 mr-1" /> Tidak Valid
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Catatan verifikasi (opsional)..."
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            value={state.catatan}
                            onChange={(e) => updateDocCatatan(doc.id_dokumen, e.target.value)}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section — Riwayat */}
          <div>
            <Card className="shadow-md rounded-xl border-none sticky top-4">
              <CardBody className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat</h2>
                <div className="relative">
                  {displayRiwayat.map((rw, idx) => {
                    const isLast = idx === displayRiwayat.length - 1;
                    const statusColors: Record<string, string> = {
                      draft: "bg-gray-400",
                      diajukan: "bg-blue-500",
                      perlu_perbaikan: "bg-amber-500",
                      diverifikasi: "bg-indigo-500",
                      terbit: "bg-green-500",
                      ditolak: "bg-red-500",
                    };
                    const dotColor = statusColors[rw.status_ke] || "bg-gray-400";

                    return (
                      <div key={rw.id_riwayat} className="relative flex gap-3">
                        {!isLast && <div className="absolute left-[7px] top-[20px] bottom-0 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />}
                        <div className={`relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full ${dotColor}`} />
                        <div className="pb-5 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {statusLabel[rw.status_ke] || rw.status_ke}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rw.nm_aktor}</p>
                          {rw.catatan && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{rw.catatan}</p>}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(rw.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-wrap gap-3 justify-end shadow-lg">
          <Button
            color="warning"
            variant="flat"
            startContent={<FiAlertTriangle className="w-4 h-4" />}
            onPress={() => {
              toast("Permintaan perbaikan telah dikirim ke pemohon", { icon: "🔄" });
            }}
          >
            Minta Perbaikan
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<FiCheck className="w-4 h-4" />}
            onPress={() => {
              toast.success("Pengajuan berhasil diverifikasi");
            }}
          >
            Verifikasi
          </Button>
          <Button
            color="success"
            variant="solid"
            startContent={<FiCheck className="w-4 h-4" />}
            onPress={() => {
              toast.success("Surat berhasil diterbitkan");
            }}
          >
            Terbitkan
          </Button>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
