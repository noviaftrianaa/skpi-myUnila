"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiUser, FiAlertCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { getPengajuanDetail, approvePengajuan, rejectPengajuan } from "@/lib/services/sim-bak/simBakService";
import type { StatusPengajuan, PersetujuanPengajuan } from "@/lib/services/sim-bak/types";
import ApprovalTimeline from "../../../components/ApprovalTimeline";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabelMap: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function PersetujuanDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState<"approve" | "reject" | null>(null);
  const [actionCatatan, setActionCatatan] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    getPengajuanDetail(id).then(setDetail).catch(() => setDetail(null)).finally(() => setLoading(false));
  }, [user, id]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!detail) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Detail Persetujuan">
        <div className="flex flex-col items-center justify-center py-20"><FiAlertCircle className="w-12 h-12 text-gray-400 mb-3" /><p className="text-gray-500">Tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/admin/persetujuan")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const status = detail.status as StatusPengajuan;
  const pemohon = detail.data_pemohon as Record<string, unknown> | null;
  const persetujuan = ((detail.persetujuan as PersetujuanPengajuan[]) ?? []).map(p => ({
    ...p, id_persetujuan: p.id_persetujuan, role_penyetuju: p.kode_role_approver, nm_penyetuju: p.nm_approver,
    status: p.keputusan === "disetujui" ? "disetujui" as const : p.keputusan === "ditolak" ? "ditolak" as const : "menunggu" as const,
    tgl_respon: p.tgl_keputusan, urutan: 1,
  }));

  const handleAction = async () => {
    if (showPanel === "reject" && !actionCatatan.trim()) { toast.error("Alasan penolakan wajib diisi"); return; }
    setActionLoading(true);
    try {
      if (showPanel === "approve") await approvePengajuan(id, { catatan: actionCatatan || undefined });
      else await rejectPengajuan(id, { catatan: actionCatatan });
      toast.success(showPanel === "approve" ? "Berhasil disetujui" : "Ditolak");
      setShowPanel(null);
      setTimeout(() => router.push("/dashboard/sim-bak/admin/persetujuan"), 1000);
    } catch { toast.error("Gagal memproses"); }
    finally { setActionLoading(false); }
  };

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Persetujuan — ${detail.nomor_permohonan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/admin/persetujuan")}><FiArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Detail Persetujuan</h1>
            <p className="text-sm text-gray-500">{String(detail.nomor_permohonan)} · {String(detail.nm_layanan)}</p>
          </div>
          <Chip size="sm" variant="flat" color={statusChipColor[status] || "default"}>{statusLabelMap[status] || status}</Chip>
        </div>

        {/* Approval Timeline */}
        {persetujuan.length > 0 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Rantai Persetujuan</h2>
            <ApprovalTimeline approvals={persetujuan} />
          </CardBody></Card>
        )}

        {/* Detail + Pemohon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md rounded-xl"><CardBody className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Pengajuan</h2>
            <div className="space-y-3 text-sm">
              {[["No. Pengajuan", detail.nomor_permohonan], ["Jenis", detail.nm_layanan], ["Tanggal", detail.tgl_diajukan ? new Date(String(detail.tgl_diajukan)).toLocaleDateString("id-ID") : "-"]].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between"><span className="text-gray-500">{String(l)}</span><span className="font-medium text-gray-900 dark:text-white">{String(v ?? "-")}</span></div>
              ))}
              {detail.alasan && <div><span className="text-gray-500 block mb-1">Alasan</span><p className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-sm italic">{String(detail.alasan)}</p></div>}
            </div>
          </CardBody></Card>

          {pemohon && (
            <Card className="shadow-md rounded-xl"><CardBody className="p-5">
              <div className="flex items-center gap-2 mb-4"><FiUser className="w-5 h-5 text-blue-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pemohon</h2></div>
              <div className="space-y-3 text-sm">
                {[["Nama", pemohon.nm_mahasiswa], ["NIM", pemohon.nim], ["Prodi", pemohon.nm_prodi], ["Fakultas", pemohon.nm_fakultas], ["Semester / IPK", `Sem. ${pemohon.semester_aktif ?? "-"} / ${pemohon.ipk ?? "-"}`]].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between"><span className="text-gray-500">{String(l)}</span><span className="font-medium text-gray-900 dark:text-white">{String(v ?? "-")}</span></div>
                ))}
              </div>
            </CardBody></Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button color="success" variant="solid" startContent={<FiCheck className="w-4 h-4" />} onPress={() => { setShowPanel("approve"); setActionCatatan(""); }}>Setujui</Button>
          <Button color="danger" variant="flat" startContent={<FiX className="w-4 h-4" />} onPress={() => { setShowPanel("reject"); setActionCatatan(""); }}>Tolak</Button>
        </div>

        {/* Slide-over */}
        {showPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPanel(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{showPanel === "approve" ? "Setujui" : "Tolak"} Permohonan</h2>
                  <Button isIconOnly variant="light" size="sm" onPress={() => setShowPanel(null)}><FiX className="w-5 h-5" /></Button>
                </div>
                <div className={`p-4 rounded-lg ${showPanel === "approve" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{showPanel === "approve" ? "Permohonan akan diteruskan ke tahap berikutnya." : "Pastikan menyertakan alasan penolakan."}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan {showPanel === "reject" && <span className="text-red-500">*</span>}</label>
                  <textarea rows={4} value={actionCatatan} onChange={e => setActionCatatan(e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={showPanel === "approve" ? "Catatan (opsional)..." : "Alasan penolakan (wajib)..."} />
                </div>
                <div className="flex gap-3">
                  <Button variant="flat" className="flex-1" onPress={() => setShowPanel(null)}>Batal</Button>
                  <Button color={showPanel === "approve" ? "success" : "danger"} className="flex-1" isLoading={actionLoading}
                    startContent={showPanel === "approve" ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />} onPress={handleAction}>
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
