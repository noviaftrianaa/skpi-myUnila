"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiAlertTriangle, FiFileText, FiUser, FiAlertCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { getPengajuanDetail, verifikasiPengajuan, mintaPerbaikan, terbitkanPengajuan } from "@/lib/services/sim-bak/simBakService";
import type { StatusPengajuan } from "@/lib/services/sim-bak/types";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function VerifikasiDetailPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    getPengajuanDetail(id).then(setDetail).catch(() => setDetail(null)).finally(() => setLoading(false));
  }, [user, id]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!detail) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Verifikasi Detail">
        <div className="flex flex-col items-center justify-center py-20"><FiAlertCircle className="w-12 h-12 text-gray-400 mb-3" /><p className="text-gray-500">Pengajuan tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/admin/verifikasi")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const status = detail.status as StatusPengajuan;
  const pemohon = detail.data_pemohon as Record<string, unknown> | null;
  const dokumen = (detail.dokumen as Array<Record<string, unknown>>) ?? [];
  const riwayat = (detail.riwayat as Array<Record<string, unknown>>) ?? [];

  const handleAction = async (action: "verifikasi" | "perbaikan" | "terbitkan") => {
    if (action === "perbaikan" && !catatan.trim()) { toast.error("Catatan wajib diisi untuk perbaikan"); return; }
    setActionLoading(true);
    try {
      if (action === "verifikasi") await verifikasiPengajuan(id, { catatan: catatan || undefined });
      else if (action === "perbaikan") await mintaPerbaikan(id, { catatan });
      else await terbitkanPengajuan(id, { catatan: catatan || undefined });
      toast.success(action === "verifikasi" ? "Berhasil diverifikasi" : action === "perbaikan" ? "Permintaan perbaikan dikirim" : "Surat diterbitkan");
      setTimeout(() => router.push("/dashboard/sim-bak/admin/verifikasi"), 1000);
    } catch { toast.error("Gagal memproses"); }
    finally { setActionLoading(false); }
  };

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Verifikasi — ${detail.nomor_permohonan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/admin/verifikasi")}><FiArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Verifikasi Pengajuan</h1>
            <p className="text-sm text-gray-500">{String(detail.nomor_permohonan)} · {String(detail.nm_layanan)}</p>
          </div>
          <Chip size="sm" variant="flat" color={statusChipColor[status] || "default"}>{statusLabel[status] || status}</Chip>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Data Pemohon */}
            {pemohon && (
              <Card className="shadow-md rounded-xl border-none"><CardBody className="p-5">
                <div className="flex items-center gap-2 mb-4"><FiUser className="w-5 h-5 text-blue-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pemohon</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[["Nama", pemohon.nm_mahasiswa], ["NIM", pemohon.nim], ["Prodi", pemohon.nm_prodi], ["Fakultas", pemohon.nm_fakultas], ["Semester", pemohon.semester_aktif], ["IPK", pemohon.ipk]].map(([label, value]) => (
                    <div key={String(label)}>
                      <p className="text-gray-500 dark:text-gray-400">{String(label)}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{String(value ?? "-")}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            )}

            {/* Dokumen */}
            <div>
              <div className="flex items-center gap-2 mb-4"><FiFileText className="w-5 h-5 text-blue-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dokumen ({dokumen.length})</h2></div>
              <div className="space-y-3">
                {dokumen.map(doc => (
                  <Card key={String(doc.id_dokumen)} className="shadow-sm rounded-xl"><CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-sm text-gray-900 dark:text-white">{String(doc.nm_dokumen)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{String(doc.nama_file_asli)} · {doc.ukuran_byte ? `${Math.round(Number(doc.ukuran_byte)/1024)} KB` : ""}</p></div>
                      <Button size="sm" variant="flat" color="primary">Lihat</Button>
                    </div>
                  </CardBody></Card>
                ))}
                {dokumen.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada dokumen</p>}
              </div>
            </div>

            {/* Catatan */}
            <Card className="shadow-md rounded-xl"><CardBody className="p-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan Verifikasi</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                placeholder="Catatan untuk pemohon atau internal..." />
            </CardBody></Card>
          </div>

          {/* Sidebar: Riwayat */}
          <div>
            <Card className="shadow-md rounded-xl border-none sticky top-4"><CardBody className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat</h2>
              {riwayat.length === 0 ? <p className="text-sm text-gray-400">Belum ada riwayat</p> : (
                <div className="relative">
                  {riwayat.map((rw, idx) => (
                    <div key={String(rw.id_riwayat)} className="relative flex gap-3">
                      {idx < riwayat.length - 1 && <div className="absolute left-[7px] top-[20px] bottom-0 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />}
                      <div className={`relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full ${{diajukan:"bg-blue-500",diverifikasi:"bg-indigo-500",terbit:"bg-green-500",ditolak:"bg-red-500",perlu_perbaikan:"bg-amber-500"}[String(rw.status_ke)] || "bg-gray-400"}`} />
                      <div className="pb-5 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{statusLabel[String(rw.status_ke)] || String(rw.status_ke)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{String(rw.nm_aktor || "-")}</p>
                        {rw.catatan && <p className="text-xs text-gray-400 mt-1 italic">{String(rw.catatan)}</p>}
                        <p className="text-xs text-gray-400 mt-1">{rw.created_at ? new Date(String(rw.created_at)).toLocaleString("id-ID") : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody></Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-wrap gap-3 justify-end shadow-lg">
          <Button color="warning" variant="flat" startContent={<FiAlertTriangle className="w-4 h-4" />} isLoading={actionLoading} onPress={() => handleAction("perbaikan")}>Minta Perbaikan</Button>
          <Button color="primary" variant="flat" startContent={<FiCheck className="w-4 h-4" />} isLoading={actionLoading} onPress={() => handleAction("verifikasi")}>Verifikasi</Button>
          <Button color="success" variant="solid" startContent={<FiCheck className="w-4 h-4" />} isLoading={actionLoading} onPress={() => handleAction("terbitkan")}>Terbitkan</Button>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
