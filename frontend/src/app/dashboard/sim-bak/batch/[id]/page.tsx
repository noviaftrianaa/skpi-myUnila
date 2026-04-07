"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiUsers, FiAlertCircle, FiUpload, FiFile } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import toast, { Toaster } from "react-hot-toast";
import { getBatchDetail, getBatchKandidat, verifikasiKandidat, uploadSkDekan, finalizeBatchWithSK } from "@/lib/services/sim-bak/simBakService";
import type { BatchPenetapan, KandidatBatch } from "@/lib/services/sim-bak/types";

const statusConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" }> = {
  draft: { label: "Draft", color: "default" },
  kandidat_ditarik: { label: "Kandidat Ditarik", color: "primary" },
  verifikasi_fakultas: { label: "Verifikasi Fakultas", color: "warning" },
  sk_dekan_terbit: { label: "SK Dekan Terbit", color: "primary" },
  finalisasi: { label: "Finalisasi", color: "primary" },
  terbit: { label: "Terbit", color: "success" },
};

const kandidatStatusColor: Record<string, "default" | "success" | "danger" | "warning"> = {
  masuk: "default", dikonfirmasi: "success", dikeluarkan: "danger",
};

export default function BatchDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [batch, setBatch] = useState<BatchPenetapan | null>(null);
  const [kandidatList, setKandidatList] = useState<KandidatBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Exclude modal
  const [excludeModal, setExcludeModal] = useState<{ id: string; nama: string } | null>(null);
  const [excludeAlasan, setExcludeAlasan] = useState("");

  // Upload SK Dekan
  const [showSkDekanForm, setShowSkDekanForm] = useState(false);
  const [skDekanFile, setSkDekanFile] = useState<File | null>(null);
  const [skDekanNomor, setSkDekanNomor] = useState("");
  const [skDekanTgl, setSkDekanTgl] = useState(new Date().toISOString().split("T")[0]);

  // Finalize modal
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [skRektorFile, setSkRektorFile] = useState<File | null>(null);
  const [skRektorNomor, setSkRektorNomor] = useState("");
  const [skRektorTgl, setSkRektorTgl] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    try {
      const [b, k] = await Promise.all([
        getBatchDetail(id),
        getBatchKandidat(id, { page, limit: 50, status_kandidat: filterStatus || undefined }),
      ]);
      setBatch(b);
      setKandidatList(k.data ?? []);
      setTotal(k.pagination?.total ?? 0);
    } catch { setBatch(null); }
    finally { setLoading(false); }
  }, [id, page, filterStatus]);

  useEffect(() => { if (user && id) fetchData(); }, [user, id, fetchData]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!batch) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Batch Detail">
        <div className="flex flex-col items-center justify-center py-20"><FiAlertCircle className="w-12 h-12 text-gray-400 mb-3" /><p className="text-gray-500">Batch tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/batch")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const cfg = statusConfig[batch.status] ?? statusConfig.draft;

  const handleVerifikasi = async (idKandidat: string, hasil: "dikonfirmasi" | "dikeluarkan", catatan?: string) => {
    setActionLoading(true);
    try {
      await verifikasiKandidat(idKandidat, { hasil, catatan });
      toast.success(hasil === "dikonfirmasi" ? "Kandidat dikonfirmasi" : "Kandidat dikeluarkan");
      setExcludeModal(null);
      setExcludeAlasan("");
      fetchData();
    } catch { toast.error("Gagal memproses"); }
    finally { setActionLoading(false); }
  };

  const handleUploadSkDekan = async () => {
    if (!skDekanFile) { toast.error("File SK Dekan wajib diupload"); return; }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", skDekanFile);
      if (skDekanNomor) formData.append("nomor_sk_dekan", skDekanNomor);
      if (skDekanTgl) formData.append("tgl_sk_dekan", skDekanTgl);
      await uploadSkDekan(id, formData);
      toast.success("SK Dekan berhasil diupload");
      setShowSkDekanForm(false);
      setSkDekanFile(null);
      fetchData();
    } catch { toast.error("Gagal upload SK Dekan"); }
    finally { setActionLoading(false); }
  };

  const handleFinalize = async () => {
    setActionLoading(true);
    try {
      await finalizeBatchWithSK(id, {
        nomor_sk_rektor: skRektorNomor || undefined,
        tgl_sk_rektor: skRektorTgl || undefined,
        file: skRektorFile || undefined,
      });
      toast.success("Batch berhasil difinalkan & SK Rektor diterbitkan");
      setShowFinalizeModal(false);
      fetchData();
    } catch { toast.error("Gagal memfinalkan batch"); }
    finally { setActionLoading(false); }
  };

  const columns: Column<KandidatBatch>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-xs">{item.nim}</span> },
    { key: "nm_mahasiswa", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span> },
    { key: "nm_prodi", label: "Prodi", render: (item) => <span className="text-sm text-gray-600">{item.nm_prodi ?? "-"}</span> },
    { key: "nm_fakultas", label: "Fakultas", render: (item) => <span className="text-sm text-gray-600">{item.nm_fakultas ?? "-"}</span> },
    { key: "ipk", label: "IPK", align: "center" as const, render: (item) => <span className="text-sm">{item.ipk ?? "-"}</span> },
    { key: "semester_aktif", label: "Smt", align: "center" as const, render: (item) => <span className="text-sm">{item.masa_studi_semester ?? item.semester_aktif ?? "-"}</span> },
    { key: "status_kandidat", label: "Status", render: (item) => (
      <Chip size="sm" color={kandidatStatusColor[item.status_kandidat] || "default"} variant="flat">{item.status_kandidat}</Chip>
    )},
    { key: "aksi", label: "Aksi", align: "center" as const, render: (item) => item.status_kandidat === "masuk" ? (
      <div className="flex gap-1">
        <Button size="sm" color="success" variant="flat" isIconOnly isLoading={actionLoading}
          onPress={() => handleVerifikasi(item.id_kandidat, "dikonfirmasi")}><FiCheck className="w-3.5 h-3.5" /></Button>
        <Button size="sm" color="danger" variant="flat" isIconOnly isLoading={actionLoading}
          onPress={() => setExcludeModal({ id: item.id_kandidat, nama: item.nm_mahasiswa })}><FiX className="w-3.5 h-3.5" /></Button>
      </div>
    ) : item.alasan_exclusion ? (
      <span className="text-xs text-red-500 italic" title={item.alasan_exclusion}>Alasan: {item.alasan_exclusion.substring(0, 30)}...</span>
    ) : null },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Batch — ${batch.kode_batch}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/batch")}><FiArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{batch.nm_batch}</h1>
            <p className="text-sm text-gray-500">{batch.kode_batch} · {batch.nm_layanan}</p>
          </div>
          <Chip size="sm" color={cfg.color} variant="flat">{cfg.label}</Chip>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Kandidat", value: batch.jumlah_kandidat, gradient: "from-blue-500 to-blue-600" },
            { label: "Dikonfirmasi", value: batch.jumlah_terverifikasi, gradient: "from-emerald-500 to-green-600" },
            { label: "Dikeluarkan", value: batch.jumlah_dikeluarkan, gradient: "from-rose-500 to-red-600" },
            { label: "Belum Diproses", value: Math.max(0, batch.jumlah_kandidat - batch.jumlah_terverifikasi - batch.jumlah_dikeluarkan), gradient: "from-amber-500 to-orange-500" },
          ].map(s => (
            <Card key={s.label} className="border-none shadow-md rounded-xl"><CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}><FiUsers className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
              </div>
            </CardBody></Card>
          ))}
        </div>

        {/* SK Dekan Section */}
        <Card className="shadow-md rounded-xl"><CardBody className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">SK Dekan</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {batch.nomor_sk_dekan
                  ? `No. ${batch.nomor_sk_dekan} — ${batch.tgl_sk_dekan ? new Date(batch.tgl_sk_dekan).toLocaleDateString("id-ID") : ""}`
                  : "Belum diupload"}
              </p>
            </div>
            {batch.path_sk_dekan ? (
              <Chip color="success" variant="flat" size="sm" startContent={<FiFile className="w-3 h-3" />}>Tersedia</Chip>
            ) : (
              <Button size="sm" color="primary" variant="flat" startContent={<FiUpload className="w-3.5 h-3.5" />}
                onPress={() => setShowSkDekanForm(true)}>Upload SK Dekan</Button>
            )}
          </div>
        </CardBody></Card>

        {/* Kandidat Table */}
        <DataTable data={kandidatList} columns={columns} searchable searchKeys={["nim", "nm_mahasiswa", "nm_prodi", "nm_fakultas"]}
          searchPlaceholder="Cari kandidat..." defaultRowsPerPage={50}
          filterSlot={
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="masuk">Masuk</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="dikeluarkan">Dikeluarkan</option>
            </select>
          }
        />

        {/* Finalize Button */}
        {batch.status !== "terbit" && (
          <div className="flex justify-end">
            <Button color="primary" size="lg" startContent={<FiCheck className="w-5 h-5" />}
              onPress={() => setShowFinalizeModal(true)}>
              Finalkan & Terbitkan SK Rektor
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Exclude Kandidat */}
      {excludeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setExcludeModal(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keluarkan Kandidat</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keluarkan <span className="font-semibold">{excludeModal.nama}</span> dari batch ini?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alasan Pengeluaran <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={excludeAlasan} onChange={e => setExcludeAlasan(e.target.value)}
                  className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Jelaskan alasan mengeluarkan mahasiswa dari batch..." />
              </div>
              <div className="flex gap-3">
                <Button variant="flat" className="flex-1" onPress={() => { setExcludeModal(null); setExcludeAlasan(""); }}>Batal</Button>
                <Button color="danger" className="flex-1" isLoading={actionLoading}
                  isDisabled={!excludeAlasan.trim()}
                  onPress={() => handleVerifikasi(excludeModal.id, "dikeluarkan", excludeAlasan)}>
                  Keluarkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload SK Dekan */}
      {showSkDekanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSkDekanForm(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload SK Dekan</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor SK Dekan</label>
                <input type="text" value={skDekanNomor} onChange={e => setSkDekanNomor(e.target.value)}
                  className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: 001/UN26.FMIPA/PP/2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal SK</label>
                <input type="date" value={skDekanTgl} onChange={e => setSkDekanTgl(e.target.value)}
                  className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File SK Dekan (PDF) *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input type="file" accept=".pdf" onChange={e => setSkDekanFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm file:cursor-pointer" />
                  {skDekanFile && <p className="mt-2 text-xs text-green-600">{skDekanFile.name} ({Math.round(skDekanFile.size / 1024)} KB)</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="flat" className="flex-1" onPress={() => setShowSkDekanForm(false)}>Batal</Button>
                <Button color="primary" className="flex-1" isLoading={actionLoading} onPress={handleUploadSkDekan}>Upload</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalize + SK Rektor */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFinalizeModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Finalkan Batch & Terbitkan SK Rektor</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">Setelah difinalkan, batch tidak dapat diubah lagi. Upload file SK Rektor yang sudah ditandatangani.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor SK Rektor</label>
                <input type="text" value={skRektorNomor} onChange={e => setSkRektorNomor(e.target.value)}
                  className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: 001/UN26/PP/2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal SK</label>
                <input type="date" value={skRektorTgl} onChange={e => setSkRektorTgl(e.target.value)}
                  className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File SK Rektor (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input type="file" accept=".pdf" onChange={e => setSkRektorFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm file:cursor-pointer" />
                  {skRektorFile && <p className="mt-2 text-xs text-green-600">{skRektorFile.name} ({Math.round(skRektorFile.size / 1024)} KB)</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="flat" className="flex-1" onPress={() => setShowFinalizeModal(false)}>Batal</Button>
                <Button color="primary" className="flex-1" isLoading={actionLoading}
                  startContent={<FiCheck className="w-4 h-4" />} onPress={handleFinalize}>
                  Finalkan & Terbitkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
