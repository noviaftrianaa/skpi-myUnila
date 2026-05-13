"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiAlertTriangle, FiFileText, FiUser, FiAlertCircle, FiEye, FiDownload, FiFile, FiUpload, FiMessageCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { getPengajuanDetail, verifikasiPengajuan, mintaPerbaikan, terbitkanPengajuan, rejectPengajuan, getWorkflowProgress, downloadDokumenUrl, cekKrsPengajuan, getRiwayatCutiPengajuan, getWhatsAppLinkPengajuan } from "@/lib/services/sim-bak/simBakService";
import bakClient from "@/lib/api/bakClient";
import type { WorkflowProgress } from "@/lib/services/sim-bak/simBakService";
import type { Pengajuan, RiwayatCutiResponse } from "@/lib/services/sim-bak/types";
import WorkflowStepper from "../../../components/WorkflowStepper";

function formatSemesterName(idSmt: string): string {
  const year = parseInt(idSmt.substring(0, 4));
  const sem = parseInt(idSmt.substring(4, 5));
  return `${year}/${year + 1} ${sem === 1 ? "Ganjil" : "Genap"}`;
}

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  diperiksa_fakultas: "secondary", menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  diperiksa_fakultas: "Diperiksa Fakultas", menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

const DEFAULT_CATATAN_PM_ALIH_TERBIT = "Setelah SK Rektor diterbitkan, mahasiswa diwajibkan melapor ke Loket BAK Universitas Lampung untuk proses administrasi lanjutan.";

export default function VerifikasiDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [fileSuratPengantar, setFileSuratPengantar] = useState<File | null>(null);
  const [nomorSuratPengantar, setNomorSuratPengantar] = useState("");
  const [tglSuratPengantar, setTglSuratPengantar] = useState(new Date().toISOString().split("T")[0]);
  // Preview dokumen
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState("");

  const openDocPreview = async (idDokumen: string, name: string, type: string) => {
    setPreviewLoading(idDokumen);
    try {
      const resp = await bakClient.get(`/layanan/dokumen/${idDokumen}/download?preview=1`, { responseType: "blob" });
      const blob = new Blob([resp.data], { type });
      setPreviewDoc({ url: URL.createObjectURL(blob), name, type });
    } catch { /* ignore */ }
    finally { setPreviewLoading(""); }
  };

  // Modal states
  const [showVerifikasiConfirm, setShowVerifikasiConfirm] = useState(false);
  const [showPerbaikanConfirm, setShowPerbaikanConfirm] = useState(false);
  const [showTerbitkanForm, setShowTerbitkanForm] = useState(false);
  const [showTolakForm, setShowTolakForm] = useState(false);
  const [showSuratPengantarForm, setShowSuratPengantarForm] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState("");
  const [nomorDokumen, setNomorDokumen] = useState("");
  const [tglDokumen, setTglDokumen] = useState(new Date().toISOString().split("T")[0]);
  const [fileSK, setFileSK] = useState<File | null>(null);
  const [filePenolakan, setFilePenolakan] = useState<File | null>(null);
  const [nomorPenolakan, setNomorPenolakan] = useState("");
  const [krsInfo, setKrsInfo] = useState<{ ada_krs: boolean; sks_semester?: number; message: string } | null>(null);
  const [riwayatCuti, setRiwayatCuti] = useState<RiwayatCutiResponse | null>(null);

  const fetchDetail = () => {
    if (!user || !id) return;
    getPengajuanDetail(id).then((d) => {
      setDetail(d);
      if (d.kode_layanan === "PM-CUTI") {
        getRiwayatCutiPengajuan(id).then(setRiwayatCuti).catch(() => {});
        if (d.kategori_cuti && d.kategori_cuti !== "terencana") {
          cekKrsPengajuan(id).then(setKrsInfo).catch(() => {});
        }
      }
    }).catch(() => setDetail(null)).finally(() => setLoading(false));
    getWorkflowProgress(id).then(setProgress).catch(() => {});
  };

  useEffect(() => { fetchDetail(); }, [user, id]);

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

  const status = detail.status;
  const pemohon = detail.data_pemohon ?? null;
  const dokumen = detail.dokumen ?? [];
  const riwayat = detail.riwayat ?? [];

  // Tahapan aktif dari progress (untuk judul dan tombol)
  const activeTahapan = progress?.tahapan_list?.find(t => t.stage_status === "active") ?? null;
  const isLastStage = activeTahapan?.status_selesai === "terbit";

  const prevTahapan = (() => {
    if (!activeTahapan || !progress?.tahapan_list) return null;
    const list = progress.tahapan_list;
    const idx = list.findIndex(t => t.id_tahapan === activeTahapan.id_tahapan);
    return idx > 0 ? list[idx - 1] : null;
  })();

  // Tentukan kode_role user aktif — check fakultas FIRST (before administrator)
  const userRole = (() => {
    const r = (user?.role ?? "").toLowerCase();
    if (r.includes("fakultas")) return "admin_fakultas";
    if (r.includes("developer") || r.includes("admin_bak") || r === "admin" || r.includes("administrator")) return "admin_bak";
    if (r.includes("pejabat") || r.includes("dekan") || r.includes("wakil_rektor") || r.includes("rektor")) return "pejabat";
    return r;
  })();
  const canActOnThisStage = !activeTahapan || activeTahapan.kode_role === userRole || userRole === "admin_bak";

  // Surat Pengantar: wajib upload jika tahapan admin_fakultas + permohonan_akademik
  const isTahapanFakultas = activeTahapan?.kode_role === "admin_fakultas" || (!activeTahapan && userRole === "admin_fakultas" && status === "diajukan");
  const isPermohonanAkademik = detail.kategori === "permohonan_akademik" || (detail.kode_layanan ?? "").startsWith("PM-");
  const requireSuratPengantar = isTahapanFakultas && isPermohonanAkademik;
  const suratPengantarUploaded = dokumen.some(d => (d.nm_dokumen ?? "").toLowerCase() === "surat pengantar dekan") || !!fileSuratPengantar;

  const handleAction = async (action: "verifikasi" | "perbaikan" | "terbitkan") => {
    if (action === "terbitkan") {
      if (detail.kode_layanan === "PM-ALIH" && !catatan.trim()) {
        setCatatan(DEFAULT_CATATAN_PM_ALIH_TERBIT);
      }
      setShowTerbitkanForm(true);
      return;
    }
    if (action === "verifikasi") {
      if (requireSuratPengantar && !suratPengantarUploaded) {
        toast.error("Upload surat pengantar dekan terlebih dahulu");
        return;
      }
      if (krsInfo?.ada_krs) {
        toast.error("KRS aktif masih terdeteksi. Pastikan KRS sudah dihapus melalui SIAKAD.");
        return;
      }
      setShowVerifikasiConfirm(true);
      return;
    }
    if (action === "perbaikan") {
      if (!catatan.trim()) { toast.error("Catatan wajib diisi untuk perbaikan"); return; }
      setShowPerbaikanConfirm(true); return;
    }
  };

  const executeAction = async (action: "verifikasi" | "perbaikan") => {
    if (action === "verifikasi" && requireSuratPengantar && !suratPengantarUploaded) {
      toast.error("Surat pengantar dekan wajib diupload");
      return;
    }
    setActionLoading(true);
    try {
      if (action === "verifikasi") {
        await verifikasiPengajuan(id, {
          catatan: catatan || undefined,
          surat_pengantar: fileSuratPengantar || undefined,
          nomor_surat_pengantar: nomorSuratPengantar || undefined,
          tgl_surat_pengantar: tglSuratPengantar || undefined,
        });
      } else {
        await mintaPerbaikan(id, { catatan });
      }
      toast.success(action === "verifikasi" ? "Berhasil diverifikasi" : "Permintaan perbaikan dikirim");
      setCatatan("");
      setFileSuratPengantar(null);
      setNomorSuratPengantar("");
      setTglSuratPengantar(new Date().toISOString().split("T")[0]);
      setShowVerifikasiConfirm(false);
      setShowPerbaikanConfirm(false);
      router.push("/dashboard/sim-bak/admin/verifikasi");
    } catch { toast.error("Gagal memproses"); }
    finally { setActionLoading(false); }
  };

  const handleTerbitkan = async () => {
    setActionLoading(true);
    try {
      await terbitkanPengajuan(id, {
        nomor_dokumen: nomorDokumen || undefined,
        tgl_dokumen: tglDokumen || undefined,
        catatan: catatan || undefined,
        file: fileSK || undefined,
        file_penolakan: filePenolakan || undefined,
        nomor_penolakan: nomorPenolakan || undefined,
      });
      toast.success("Surat berhasil diterbitkan");
      setShowTerbitkanForm(false);
      setCatatan("");
      fetchDetail(); // refresh data + progress
    } catch { toast.error("Gagal menerbitkan surat"); }
    finally { setActionLoading(false); }
  };

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Verifikasi — ${detail.nomor_permohonan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/admin/verifikasi")}><FiArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {status === "terbit" ? "Detail Pengajuan (Terbit)" :
               status === "ditolak" ? "Detail Pengajuan (Ditolak)" :
               status === "perlu_perbaikan" ? "Detail Pengajuan (Perbaikan)" :
               activeTahapan ? activeTahapan.nm_tahapan :
               "Detail Pengajuan"}
            </h1>
            <p className="text-sm text-gray-500">{String(detail.nomor_permohonan)}</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{String(detail.nm_layanan)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat" color={statusChipColor[status] || "default"}>{statusLabel[status] || status}</Chip>
            {detail.a_dari_luar && <Chip size="sm" variant="flat" color="secondary">Dari Luar Unila</Chip>}
          </div>
        </div>

        {/* Workflow Stepper */}
        {progress && (
          <Card className="shadow-md rounded-xl border-none"><CardBody className="p-5">
            <WorkflowStepper
              tahapanList={progress.tahapan_list}
              currentStep={progress.current}
              totalSteps={progress.total}
            />
          </CardBody></Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Data Pemohon */}
            {pemohon && (
              <Card className="shadow-md rounded-xl border-none"><CardBody className="p-5">
                <div className="flex items-center gap-2 mb-4"><FiUser className="w-5 h-5 text-blue-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pemohon</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ["Nama", pemohon.nm_mahasiswa],
                    ["NIM", pemohon.nim],
                    ...(detail.a_dari_luar ? [["PT Asal", pemohon.nm_pt_asal], ["Akreditasi Prodi Asal", pemohon.akreditasi_prodi_asal]] : []),
                    ["Prodi", pemohon.nm_prodi],
                    ["Fakultas", pemohon.nm_fakultas],
                    ["Semester", pemohon.semester_aktif],
                    ["IPK", pemohon.ipk],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <p className="text-gray-500 dark:text-gray-400">{String(label)}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{String(value ?? "-")}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            )}

            {/* Surat Pendukung — SK-PKKMB & SK-KTM */}
            {(detail.kode_layanan === "SK-PKKMB" || detail.kode_layanan === "SK-KTM") && (detail.nomor_surat_polisi || detail.nomor_surat_ket_aktif) && (
              <Card className="shadow-md rounded-xl border-amber-200 dark:border-amber-800 border"><CardBody className="p-5">
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-4">Surat Pendukung</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detail.nomor_surat_polisi && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-gray-500 mb-0.5">Surat Kehilangan (Kepolisian)</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{String(detail.nomor_surat_polisi)}</p>
                      {detail.tgl_surat_polisi && <p className="text-xs text-gray-500 mt-0.5">{new Date(String(detail.tgl_surat_polisi)).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>}
                    </div>
                  )}
                  {detail.nomor_surat_ket_aktif && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-gray-500 mb-0.5">Surat Keterangan Aktif (Fakultas)</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{String(detail.nomor_surat_ket_aktif)}</p>
                      {detail.tgl_surat_ket_aktif && <p className="text-xs text-gray-500 mt-0.5">{new Date(String(detail.tgl_surat_ket_aktif)).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>}
                    </div>
                  )}
                </div>
              </CardBody></Card>
            )}

            {/* Detail Pengajuan: alasan + info cuti/alih/undur */}
            {(detail.alasan || detail.id_smt_mulai_cuti || detail.kode_layanan === "PM-CUTI" || detail.kode_layanan === "PM-UNDUR") && (
              <Card className="shadow-md rounded-xl border-none"><CardBody className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Pengajuan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detail.alasan && (
                    <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Alasan Permohonan</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{String(detail.alasan)}</p>
                    </div>
                  )}
                  {detail.kode_layanan === "PM-UNDUR" && (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Kategori Pengunduran</p>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {detail.kategori_undur === "pindah_pt" ? "Pindah ke Universitas Lain" : "Pengunduran Diri"}
                        </p>
                      </div>
                      {detail.kategori_undur === "pindah_pt" && detail.nm_pt_tujuan && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Perguruan Tinggi Tujuan</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{String(detail.nm_pt_tujuan)}</p>
                        </div>
                      )}
                    </>
                  )}
                  {detail.kode_layanan === "PM-CUTI" && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Kategori Cuti</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize">
                        {detail.kategori_cuti ? String(detail.kategori_cuti).replace(/_/g, " ") : "Terencana"}
                      </p>
                    </div>
                  )}
                  {detail.jumlah_semester_cuti && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Jumlah Semester Cuti</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{detail.jumlah_semester_cuti} semester</p>
                    </div>
                  )}
                  {detail.id_smt_mulai_cuti && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Semester Mulai Cuti</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatSemesterName(String(detail.id_smt_mulai_cuti))}</p>
                    </div>
                  )}
                  {(detail.id_smt_akhir_cuti || (detail.id_smt_mulai_cuti && detail.jumlah_semester_cuti)) && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Semester Akhir Cuti</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {formatSemesterName(detail.id_smt_akhir_cuti
                          ? String(detail.id_smt_akhir_cuti)
                          : (() => { let y = parseInt(String(detail.id_smt_mulai_cuti).substring(0,4)), s = parseInt(String(detail.id_smt_mulai_cuti).charAt(4)); for (let i = 1; i < Number(detail.jumlah_semester_cuti); i++) { if (s===1) s=2; else { s=1; y++; } } return `${y}${s}`; })()
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody></Card>
            )}

            {/* Riwayat Cuti Mahasiswa */}
            {riwayatCuti && (
              (() => {
                const total = riwayatCuti.total_semester_cuti;
                const hasSimbak = riwayatCuti.simbak.length > 0;
                const hasPdut = riwayatCuti.pdut.length > 0;
                const isEmpty = !hasSimbak && !hasPdut;
                const borderColor = isEmpty || total === 0
                  ? "border-green-300 dark:border-green-700"
                  : total >= 4
                    ? "border-red-300 dark:border-red-700"
                    : "border-amber-300 dark:border-amber-700";
                const chipColor = isEmpty || total === 0 ? "success" : total >= 4 ? "danger" : "warning";
                const statusColors: Record<string, string> = {
                  draft: "bg-gray-100 text-gray-600", diajukan: "bg-blue-100 text-blue-700",
                  diverifikasi: "bg-indigo-100 text-indigo-700", menunggu_persetujuan: "bg-amber-100 text-amber-700",
                  disetujui: "bg-emerald-100 text-emerald-700", terbit: "bg-green-100 text-green-700",
                  ditolak: "bg-red-100 text-red-700", perlu_perbaikan: "bg-orange-100 text-orange-700",
                };
                return (
                  <Card className={`shadow-md rounded-xl border-2 ${borderColor}`}><CardBody className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Riwayat Cuti Mahasiswa</h2>
                      <Chip color={chipColor as "success" | "danger" | "warning"} variant="flat" size="sm">{total} semester cuti</Chip>
                    </div>
                    {total >= 4 && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300">⚠ Mahasiswa telah mengambil cuti {total} semester. Perhatikan batas maksimal cuti akademik.</p>
                      </div>
                    )}
                    {isEmpty ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat cuti sebelumnya.</p>
                    ) : (
                      <div className="space-y-4">
                        {hasSimbak && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Data SI MBAK</p>
                            <div className="space-y-2">
                              {riwayatCuti.simbak.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-600"}`}>
                                      {item.status === "terbit" ? "Terbit" : item.status === "ditolak" ? "Ditolak" : item.status === "draft" ? "Draft" : item.status.replace(/_/g, " ")}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.nomor_permohonan}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.kategori_cuti ? item.kategori_cuti.replace(/_/g, " ") : "terencana"}
                                        {item.id_smt_mulai_cuti && ` · ${formatSemesterName(item.id_smt_mulai_cuti)}`}
                                        {item.id_smt_akhir_cuti && ` — ${formatSemesterName(item.id_smt_akhir_cuti)}`}
                                        {item.jumlah_semester_cuti && ` (${item.jumlah_semester_cuti} smt)`}
                                      </p>
                                    </div>
                                  </div>
                                  {item.tgl_diajukan && <span className="text-xs text-gray-400 flex-shrink-0">{new Date(item.tgl_diajukan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasPdut && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Data SIAKAD</p>
                            <div className="space-y-2">
                              {riwayatCuti.pdut.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_smt}</p>
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{item.nm_stat_mhs}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody></Card>
                );
              })()
            )}

            {/* KRS Warning — cuti tidak terencana */}
            {krsInfo?.ada_krs && (
              <Card className="shadow-md rounded-xl border-2 border-red-300 dark:border-red-700"><CardBody className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-red-700 dark:text-red-400">KRS Aktif Terdeteksi</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{krsInfo.message}</p>
                    <p className="text-xs text-gray-500 mt-2">Verifikasi tidak dapat dilanjutkan sampai KRS dihapus. Setelah KRS dihapus di SIAKAD, refresh halaman ini untuk melanjutkan.</p>
                  </div>
                </div>
              </CardBody></Card>
            )}

            {/* Dokumen */}
            <div>
              <div className="flex items-center gap-2 mb-4"><FiFileText className="w-5 h-5 text-blue-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dokumen ({dokumen.length})</h2></div>
              <div className="space-y-3">
                {dokumen.map(doc => {
                  const tipe = String(doc.tipe_file ?? "");
                  const canPreview = tipe.startsWith("image/") || tipe === "application/pdf";
                  const isSuratPengantar = String(doc.nm_dokumen ?? "").toLowerCase() === "surat pengantar dekan";
                  return (
                    <Card key={String(doc.id_dokumen)} className={`shadow-sm rounded-xl ${isSuratPengantar ? "border-2 border-green-200 dark:border-green-800" : ""}`}><CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSuratPengantar ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                            <FiFile className={`w-4 h-4 ${isSuratPengantar ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{String(doc.nm_dokumen)}</p>
                              {isSuratPengantar && <Chip size="sm" variant="flat" color="success" className="text-xs h-5">Verifikasi Fakultas</Chip>}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{String(doc.nama_file_asli)} · {doc.ukuran_byte ? `${Math.round(Number(doc.ukuran_byte)/1024)} KB` : ""}</p>
                            {isSuratPengantar && doc.nomor_dokumen && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">No. {String(doc.nomor_dokumen)}{doc.tgl_dokumen ? ` — ${new Date(String(doc.tgl_dokumen)).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}` : ""}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {canPreview && (
                            <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
                              isLoading={previewLoading === String(doc.id_dokumen)}
                              onPress={() => openDocPreview(String(doc.id_dokumen), String(doc.nama_file_asli), tipe)}>
                              Lihat
                            </Button>
                          )}
                          <Button size="sm" variant="flat" startContent={<FiDownload className="w-3.5 h-3.5" />}
                            onPress={() => {
                              const { getToken } = require("@/lib/api/client");
                              const token = getToken("ACCESS");
                              const url = downloadDokumenUrl(String(doc.id_dokumen));
                              window.open(token ? `${url}?token=${token}` : url, "_blank");
                            }}>
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </CardBody></Card>
                  );
                })}
                {dokumen.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada dokumen</p>}
              </div>
            </div>

            {/* Catatan — hanya tampil jika masih bisa diproses */}
            {["diajukan", "diverifikasi", "menunggu_persetujuan", "disetujui"].includes(status) && (
              <Card className="shadow-md rounded-xl"><CardBody className="p-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan Verifikasi</label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                    <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none resize-none"
                      placeholder="Catatan untuk pemohon atau internal..." />
                  </div>
                </div>
              </CardBody></Card>
            )}

            {/* Info: Surat Terbit */}
            {status === "terbit" && (() => {
              const dokumenHasil = detail.dokumen_hasil ?? [];
              return (
                <Card className="shadow-md rounded-xl border-2 border-green-200 dark:border-green-800"><CardBody className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <FiCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-green-700 dark:text-green-400">Surat Telah Diterbitkan</h3>
                        <p className="text-xs text-gray-500">
                          {detail.nomor_dokumen_hasil ? `No. ${detail.nomor_dokumen_hasil}` : ""}
                          {detail.tgl_dokumen_hasil ? ` — ${new Date(String(detail.tgl_dokumen_hasil)).toLocaleDateString("id-ID", {day:"2-digit",month:"long",year:"numeric"})}` : ""}
                        </p>
                      </div>
                    </div>
                    {dokumenHasil.length > 0 && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
                          onPress={async () => {
                            try {
                              const resp = await bakClient.get(`/layanan/dokumen-hasil/${dokumenHasil[0].id_dokumen_hasil}/download?preview=1`, { responseType: "blob" });
                              const blob = new Blob([resp.data], { type: String(dokumenHasil[0].tipe_file || "application/pdf") });
                              setPreviewDoc({ url: URL.createObjectURL(blob), name: String(dokumenHasil[0].nm_dokumen || "Surat"), type: String(dokumenHasil[0].tipe_file || "") });
                            } catch { toast.error("Gagal memuat preview"); }
                          }}>
                          Lihat Surat
                        </Button>
                        <Button size="sm" color="success" startContent={<FiDownload className="w-3.5 h-3.5" />}
                          onPress={() => {
                            const url = downloadDokumenUrl(String(dokumenHasil[0].id_dokumen_hasil)).replace("/dokumen/", "/dokumen-hasil/");
                            const { getToken } = require("@/lib/api/client");
                            const token = getToken("ACCESS");
                            window.open(token ? `${url}?token=${token}` : url, "_blank");
                          }}>
                          Download
                        </Button>
                        <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe57]" startContent={<FiMessageCircle className="w-3.5 h-3.5" />}
                          onPress={async () => {
                            try {
                              const result = await getWhatsAppLinkPengajuan(id, "status_terbit");
                              window.open(result.wa_url, "_blank");
                              toast.success(`WhatsApp terbuka untuk ${result.nama}`);
                            } catch (e) {
                              const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal membuat link WhatsApp";
                              toast.error(msg);
                            }
                          }}>
                          Kirim WA
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody></Card>
              );
            })()}

            {/* Info: Ditolak */}
            {status === "ditolak" && (
              <Card className="shadow-md rounded-xl border-2 border-red-200 dark:border-red-800"><CardBody className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FiX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Pengajuan Ditolak</h3>
                    <p className="text-xs text-gray-500">Pengajuan ini telah ditolak</p>
                  </div>
                </div>
              </CardBody></Card>
            )}

            {/* Info: Perlu Perbaikan */}
            {status === "perlu_perbaikan" && (
              <Card className="shadow-md rounded-xl border-2 border-amber-200 dark:border-amber-800"><CardBody className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400">Menunggu Perbaikan Mahasiswa</h3>
                    <p className="text-xs text-gray-500">Pengajuan dikembalikan ke mahasiswa untuk diperbaiki</p>
                  </div>
                </div>
              </CardBody></Card>
            )}
          </div>

          {/* Sidebar: Riwayat */}
          <div>
            <Card className="shadow-md rounded-xl border-none sticky top-4"><CardBody className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat</h2>
              {riwayat.filter(r => String(r.status_ke) !== "draft").length === 0 ? <p className="text-sm text-gray-400">Belum ada riwayat</p> : (
                <div className="relative">
                  {riwayat.filter(r => String(r.status_ke) !== "draft").map((rw, idx, arr) => (
                    <div key={String(rw.id_riwayat)} className="relative flex gap-3">
                      {idx < arr.length - 1 && <div className="absolute left-[7px] top-[20px] bottom-0 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />}
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

        {/* Card Surat Pengantar Dekan — hanya untuk admin_fakultas + permohonan_akademik */}
        {requireSuratPengantar && canActOnThisStage && (
          <Card className={`shadow-md rounded-xl border-2 ${suratPengantarUploaded ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10" : "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10"}`}><CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${suratPengantarUploaded ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                  {suratPengantarUploaded
                    ? <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    : <FiUpload className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Surat Pengantar Dekan</h2>
                  <p className={`text-xs mt-0.5 ${suratPengantarUploaded ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {suratPengantarUploaded
                      ? fileSuratPengantar
                        ? `${fileSuratPengantar.name} (${Math.round(fileSuratPengantar.size / 1024)} KB)${nomorSuratPengantar ? ` — No. ${nomorSuratPengantar}` : ""}`
                        : (() => { const sp = dokumen.find(d => (d.nm_dokumen ?? "").toLowerCase() === "surat pengantar dekan"); return sp?.nomor_dokumen ? `No. ${sp.nomor_dokumen} — ${sp.tgl_dokumen ? new Date(String(sp.tgl_dokumen)).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : ""}` : "Sudah diupload sebelumnya"; })()
                      : "⚠ Wajib diupload sebelum memproses verifikasi"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {suratPengantarUploaded ? (
                  <>
                    <Chip color="success" variant="flat" size="sm" startContent={<FiCheck className="w-3 h-3" />}>Tersedia</Chip>
                    {fileSuratPengantar && (
                      <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
                        onPress={() => {
                          const url = URL.createObjectURL(fileSuratPengantar);
                          setPreviewDoc({ url, name: fileSuratPengantar.name, type: "application/pdf" });
                        }}>Lihat</Button>
                    )}
                    <Button size="sm" variant="flat" startContent={<FiUpload className="w-3.5 h-3.5" />}
                      onPress={() => setShowSuratPengantarForm(true)}>Ganti</Button>
                  </>
                ) : (
                  <Button size="sm" color="warning" variant="solid" startContent={<FiUpload className="w-3.5 h-3.5" />}
                    onPress={() => setShowSuratPengantarForm(true)}>Upload Surat Pengantar</Button>
                )}
              </div>
            </div>
          </CardBody></Card>
        )}

        {/* Info Surat Pengantar Dekan — untuk admin BAK melihat status upload (read-only) */}
        {!requireSuratPengantar && isPermohonanAkademik && userRole === "admin_bak" && (
          (() => {
            const spDoc = dokumen.find(d => (d.nm_dokumen ?? "").toLowerCase() === "surat pengantar dekan");
            const hasUploaded = !!spDoc;
            return (
              <Card className={`shadow-md rounded-xl border-2 ${hasUploaded ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10" : "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"}`}><CardBody className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hasUploaded ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {hasUploaded
                      ? <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      : <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Surat Pengantar Dekan</h2>
                    <p className={`text-xs mt-0.5 ${hasUploaded ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {hasUploaded
                        ? spDoc?.nomor_dokumen
                          ? `No. ${spDoc.nomor_dokumen} — ${spDoc.tgl_dokumen ? new Date(String(spDoc.tgl_dokumen)).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : ""}`
                          : "Sudah diupload oleh admin fakultas"
                        : "⚠ Belum diupload oleh admin fakultas"}
                    </p>
                  </div>
                  {hasUploaded && <Chip color="success" variant="flat" size="sm" className="ml-auto" startContent={<FiCheck className="w-3 h-3" />}>Tersedia</Chip>}
                  {!hasUploaded && <Chip color="danger" variant="flat" size="sm" className="ml-auto" startContent={<FiAlertCircle className="w-3 h-3" />}>Belum Ada</Chip>}
                </div>
              </CardBody></Card>
            );
          })()
        )}

        {/* Action Bar — hanya jika status bisa diproses DAN role user cocok dengan tahapan aktif */}
        {["diajukan", "diverifikasi", "menunggu_persetujuan", "disetujui"].includes(status) && canActOnThisStage && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-wrap gap-3 justify-end shadow-lg">
            {/* Tolak */}
            <Button color="danger" variant="flat" startContent={<FiX className="w-4 h-4" />} onPress={() => setShowTolakForm(true)}>Tolak</Button>
            {/* Minta Perbaikan — bukan di tahap terakhir */}
            {!isLastStage && (
              <Button color="warning" variant="flat" startContent={<FiAlertTriangle className="w-4 h-4" />} isLoading={actionLoading} onPress={() => handleAction("perbaikan")}>Minta Perbaikan</Button>
            )}
            {/* Verifikasi/Proses — jika bukan tahap terakhir */}
            {!isLastStage && (
              <Button color="primary" variant="flat" startContent={<FiCheck className="w-4 h-4" />} isLoading={actionLoading}
                isDisabled={(requireSuratPengantar && !suratPengantarUploaded) || !!krsInfo?.ada_krs}
                onPress={() => handleAction("verifikasi")}>
                {activeTahapan ? `Proses (${activeTahapan.nm_tahapan})` : "Verifikasi"}
              </Button>
            )}
            {/* Terbitkan — hanya di tahap terakhir (status_selesai = terbit) */}
            {isLastStage && (
              <Button color="success" variant="solid" startContent={<FiCheck className="w-4 h-4" />} isLoading={actionLoading} onPress={() => handleAction("terbitkan")}>Terbitkan</Button>
            )}
          </div>
        )}

        {/* Modal Preview Dokumen */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null); }} />
            <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                  <FiFile className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{previewDoc.name}</p>
                </div>
                <Button isIconOnly variant="light" size="sm" onPress={() => { URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null); }}>
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-1 bg-gray-100 dark:bg-gray-800">
                {previewDoc.type.startsWith("image/") ? (
                  <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-[75vh] mx-auto rounded" />
                ) : previewDoc.type === "application/pdf" ? (
                  <iframe src={previewDoc.url} className="w-full h-[75vh] rounded" title={previewDoc.name} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FiFile className="w-12 h-12 mb-3" />
                    <p className="text-sm">Preview tidak tersedia untuk tipe file ini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Upload Surat Pengantar */}
        {showSuratPengantarForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuratPengantarForm(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4">
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Surat Pengantar Dekan</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Surat Pengantar <span className="text-red-500">*</span></label>
                  <div style={{ border: "1px solid #d1d5db", borderRadius: 8 }}>
                    <input type="text" value={nomorSuratPengantar} onChange={e => setNomorSuratPengantar(e.target.value)}
                      placeholder="cth: 001/UN26.FMIPA/PP/2026"
                      className="w-full px-3 py-2 text-sm bg-transparent rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Surat Pengantar <span className="text-red-500">*</span></label>
                  <div style={{ border: "1px solid #d1d5db", borderRadius: 8 }}>
                    <input type="date" value={tglSuratPengantar} onChange={e => setTglSuratPengantar(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-transparent rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Surat Pengantar (PDF) <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <input type="file" accept=".pdf" onChange={e => setFileSuratPengantar(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm file:cursor-pointer" />
                    {fileSuratPengantar && <p className="mt-2 text-xs text-green-600">{fileSuratPengantar.name} ({Math.round(fileSuratPengantar.size / 1024)} KB)</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="flat" className="flex-1" onPress={() => setShowSuratPengantarForm(false)}>Batal</Button>
                  <Button color="primary" className="flex-1"
                    isDisabled={!fileSuratPengantar || !nomorSuratPengantar.trim()}
                    onPress={() => { setShowSuratPengantarForm(false); toast.success("Surat pengantar siap dikirim bersama verifikasi"); }}>
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Verifikasi */}
        {showVerifikasiConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowVerifikasiConfirm(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 overflow-hidden">
              <div className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {activeTahapan ? activeTahapan.nm_tahapan : "Verifikasi Pengajuan"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Proses pengajuan ini ke tahapan berikutnya?
                  </p>
                </div>
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Pastikan:</p>
                  <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <FiCheck className={`w-4 h-4 flex-shrink-0 ${dokumen.length > 0 ? "text-green-500" : "text-gray-300"}`} />
                      Dokumen persyaratan sudah lengkap
                    </li>
                    {requireSuratPengantar && (
                      <li className="flex items-center gap-2">
                        <FiCheck className={`w-4 h-4 flex-shrink-0 ${suratPengantarUploaded ? "text-green-500" : "text-gray-300"}`} />
                        Surat pengantar dekan sudah diupload
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 flex-shrink-0 text-green-500" />
                      Data pemohon sudah diperiksa dan benar
                    </li>
                  </ul>
                </div>
                {activeTahapan && (
                  <p className="mt-3 text-center text-xs text-gray-400">Status akan berubah: {activeTahapan.status_masuk} → {activeTahapan.status_selesai}</p>
                )}
              </div>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowVerifikasiConfirm(false)} disabled={actionLoading}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Batal</button>
                <div className="w-px bg-gray-200 dark:bg-gray-700" />
                <button onClick={() => executeAction("verifikasi")} disabled={actionLoading}
                  className="flex-1 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50">
                  {actionLoading ? "Memproses..." : "Ya, Proses"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Minta Perbaikan */}
        {showPerbaikanConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPerbaikanConfirm(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Minta Perbaikan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {prevTahapan && prevTahapan.kode_role !== "mahasiswa"
                    ? `Kembalikan pengajuan ke ${prevTahapan.nm_tahapan} untuk diperbaiki?`
                    : "Kembalikan pengajuan ke mahasiswa untuk diperbaiki?"}
                </p>
                {catatan && <p className="mt-2 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800 rounded-lg p-2">Catatan: {catatan}</p>}
              </div>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowPerbaikanConfirm(false)} disabled={actionLoading}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Batal</button>
                <div className="w-px bg-gray-200 dark:bg-gray-700" />
                <button onClick={() => executeAction("perbaikan")} disabled={actionLoading}
                  className="flex-1 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50">
                  {actionLoading ? "Memproses..." : "Ya, Minta Perbaikan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form Tolak */}
        {showTolakForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTolakForm(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tolak Pengajuan</h2>
                  <Button isIconOnly variant="light" size="sm" onPress={() => setShowTolakForm(false)}><FiX className="w-5 h-5" /></Button>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">Pengajuan yang ditolak tidak dapat diproses kembali. Pastikan alasan penolakan sudah jelas.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Penolakan <span className="text-red-500">*</span></label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                    <textarea rows={4} value={alasanTolak} onChange={e => setAlasanTolak(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 focus:outline-none resize-none"
                      placeholder="Jelaskan alasan penolakan pengajuan..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="flat" className="flex-1" onPress={() => setShowTolakForm(false)}>Batal</Button>
                  <Button color="danger" className="flex-1" isLoading={actionLoading} isDisabled={!alasanTolak.trim()}
                    startContent={<FiX className="w-4 h-4" />}
                    onPress={async () => {
                      setActionLoading(true);
                      try {
                        await rejectPengajuan(id, { catatan: alasanTolak });
                        toast.success("Pengajuan berhasil ditolak");
                        setShowTolakForm(false);
                        setAlasanTolak("");
                        router.push("/dashboard/sim-bak/admin/verifikasi");
                      } catch { toast.error("Gagal menolak pengajuan"); }
                      finally { setActionLoading(false); }
                    }}>
                    Tolak Pengajuan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form Terbitkan */}
        {showTerbitkanForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTerbitkanForm(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Terbitkan Surat</h2>
                  <Button isIconOnly variant="light" size="sm" onPress={() => setShowTerbitkanForm(false)}><FiX className="w-5 h-5" /></Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Upload file surat/SK yang sudah ditandatangani dalam format PDF.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Surat</label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #9ca3af" }} className="overflow-hidden shadow-sm">
                    <input type="text" value={nomorDokumen} onChange={e => setNomorDokumen(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none"
                      placeholder="Contoh: 001/UN26.BAK/SK/2026" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Surat</label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #9ca3af" }} className="overflow-hidden shadow-sm">
                    <input type="date" value={tglDokumen} onChange={e => setTglDokumen(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Surat (PDF)</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input type="file" accept=".pdf" onChange={e => setFileSK(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm hover:file:bg-blue-100 file:cursor-pointer" />
                    {fileSK && (
                      <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        {fileSK.name} ({Math.round(fileSK.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Surat Penolakan — khusus PM-ALIH */}
                {detail.kode_layanan === "PM-ALIH" && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Surat Penolakan (jika ada yang ditolak)</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nomor Surat Penolakan</label>
                        <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                          <input type="text" value={nomorPenolakan} onChange={e => setNomorPenolakan(e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                            placeholder="Nomor surat penolakan (opsional)" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">File Surat Penolakan (PDF)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                          <input type="file" accept=".pdf" onChange={e => setFilePenolakan(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 file:font-medium file:text-xs file:cursor-pointer" />
                          {filePenolakan && <p className="mt-1 text-xs text-red-600">{filePenolakan.name} ({Math.round(filePenolakan.size / 1024)} KB)</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan (opsional)</label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                    <textarea rows={2} value={catatan} onChange={e => setCatatan(e.target.value)}
                      className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 focus:outline-none resize-none"
                      placeholder="Catatan penerbitan..." />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Catatan ini akan disertakan di SK dan notifikasi ke mahasiswa.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="flat" className="flex-1" onPress={() => setShowTerbitkanForm(false)}>Batal</Button>
                  <Button color="success" className="flex-1" isLoading={actionLoading} startContent={<FiCheck className="w-4 h-4" />} onPress={handleTerbitkan}>
                    Terbitkan Surat
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
