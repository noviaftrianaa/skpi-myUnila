"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { dummyPengajuan, dummyPersetujuan } from "@/lib/services/sim-bak/dummyData";
import ApprovalTimeline from "../../../components/ApprovalTimeline";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function PersetujuanDetailPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const pengajuan = dummyPengajuan.find((p) => p.id_pengajuan === id);
  const approvals = dummyPersetujuan.filter((a) => a.id_pengajuan === id);
  // Fallback to peng-005 approvals if none found for this id
  const displayApprovals = approvals.length > 0 ? approvals : dummyPersetujuan.filter((a) => a.id_pengajuan === "peng-005");

  const [showPanel, setShowPanel] = useState<"approve" | "reject" | null>(null);
  const [actionCatatan, setActionCatatan] = useState("");

  const handleApprove = () => {
    if (!actionCatatan.trim() && showPanel === "reject") {
      toast.error("Catatan wajib diisi untuk penolakan");
      return;
    }
    if (showPanel === "approve") {
      toast.success("Permohonan berhasil disetujui");
    } else {
      toast.error("Permohonan ditolak");
    }
    setShowPanel(null);
    setActionCatatan("");
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!pengajuan) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Detail Persetujuan">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Pengajuan tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/admin/persetujuan")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const pemohon = pengajuan.data_pemohon;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Persetujuan — ${pengajuan.no_pengajuan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/admin/persetujuan")}>
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Detail Persetujuan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pengajuan.no_pengajuan} &middot; {pengajuan.nm_layanan}</p>
          </div>
          <Chip size="sm" variant="flat" color={statusChipColor[pengajuan.status] || "default"}>
            {statusLabel[pengajuan.status] || pengajuan.status}
          </Chip>
        </div>

        {/* Approval Chain Stepper */}
        <Card className="shadow-md rounded-xl border-none">
          <CardBody className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Rantai Persetujuan</h2>
            <ApprovalTimeline approvals={displayApprovals} />
          </CardBody>
        </Card>

        {/* Pengajuan Detail + Data Pemohon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pengajuan Detail */}
          <Card className="shadow-md rounded-xl border-none">
            <CardBody className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Pengajuan</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">No. Pengajuan</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">{pengajuan.no_pengajuan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Jenis Layanan</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pengajuan.nm_layanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tanggal Pengajuan</span>
                  <span className="text-gray-900 dark:text-white">
                    {pengajuan.tgl_pengajuan ? new Date(pengajuan.tgl_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </span>
                </div>
                {pengajuan.catatan_pemohon && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Catatan Pemohon</span>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-sm italic">{pengajuan.catatan_pemohon}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Data Pemohon */}
          <Card className="shadow-md rounded-xl border-none">
            <CardBody className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pemohon</h2>
              </div>
              {pemohon && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Nama</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pemohon.nm_lengkap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">NPM</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{pemohon.npm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Program Studi</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pemohon.nm_prodi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Fakultas</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pemohon.nm_fakultas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Semester / IPK</span>
                    <span className="font-medium text-gray-900 dark:text-white">Sem. {pemohon.semester} / {pemohon.ipk}</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            color="success"
            variant="solid"
            startContent={<FiCheck className="w-4 h-4" />}
            onPress={() => { setShowPanel("approve"); setActionCatatan(""); }}
          >
            Setujui
          </Button>
          <Button
            color="danger"
            variant="flat"
            startContent={<FiX className="w-4 h-4" />}
            onPress={() => { setShowPanel("reject"); setActionCatatan(""); }}
          >
            Tolak
          </Button>
        </div>

        {/* Slide-over Panel */}
        {showPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPanel(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {showPanel === "approve" ? "Setujui Permohonan" : "Tolak Permohonan"}
                  </h2>
                  <Button isIconOnly variant="light" size="sm" onPress={() => setShowPanel(null)}>
                    <FiX className="w-5 h-5" />
                  </Button>
                </div>

                <div className={`p-4 rounded-lg ${showPanel === "approve" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {showPanel === "approve"
                      ? "Anda akan menyetujui permohonan ini. Permohonan akan diteruskan ke tahap berikutnya."
                      : "Anda akan menolak permohonan ini. Pastikan Anda menyertakan alasan penolakan."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan {showPanel === "reject" && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                    placeholder={showPanel === "approve" ? "Catatan persetujuan (opsional)..." : "Alasan penolakan (wajib)..."}
                    value={actionCatatan}
                    onChange={(e) => setActionCatatan(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="flat" color="default" className="flex-1" onPress={() => setShowPanel(null)}>
                    Batal
                  </Button>
                  <Button
                    color={showPanel === "approve" ? "success" : "danger"}
                    className="flex-1"
                    startContent={showPanel === "approve" ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                    onPress={handleApprove}
                  >
                    {showPanel === "approve" ? "Setujui" : "Tolak"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
