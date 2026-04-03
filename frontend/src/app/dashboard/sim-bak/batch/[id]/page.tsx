"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiCheck, FiX, FiUsers, FiAlertCircle, FiDownload } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import toast, { Toaster } from "react-hot-toast";
import { getBatchDetail, getBatchKandidat, verifikasiKandidat, finalizeBatch } from "@/lib/services/sim-bak/simBakService";
import type { BatchPenetapan, KandidatBatch } from "@/lib/services/sim-bak/types";

const statusConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" }> = {
  draft: { label: "Draft", color: "default" },
  verifikasi_fakultas: { label: "Verifikasi Fakultas", color: "warning" },
  finalisasi: { label: "Finalisasi", color: "primary" },
  terbit: { label: "Terbit", color: "success" },
};

const kandidatStatusColor: Record<string, "default" | "success" | "danger" | "warning"> = {
  masuk: "default", terverifikasi: "success", dikeluarkan: "danger",
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

  const handleVerifikasi = async (idKandidat: string, hasil: "valid" | "dikeluarkan") => {
    setActionLoading(true);
    try {
      await verifikasiKandidat(idKandidat, { hasil });
      toast.success(hasil === "valid" ? "Kandidat diverifikasi" : "Kandidat dikeluarkan");
      fetchData();
    } catch { toast.error("Gagal memproses"); }
    finally { setActionLoading(false); }
  };

  const handleFinalize = async () => {
    if (!confirm("Finalkan batch ini? SK Rektor akan diterbitkan.")) return;
    setActionLoading(true);
    try {
      await finalizeBatch(id);
      toast.success("Batch berhasil difinalkan");
      fetchData();
    } catch { toast.error("Gagal memfinalkan"); }
    finally { setActionLoading(false); }
  };

  const columns: Column<KandidatBatch>[] = [
    { key: "nim", label: "NIM", sortable: true, render: (item) => <span className="font-mono text-sm">{item.nim}</span> },
    { key: "nm_mahasiswa", label: "Nama", sortable: true, render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span> },
    { key: "nm_prodi", label: "Prodi", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.nm_prodi ?? "-"}</span> },
    { key: "nm_fakultas", label: "Fakultas", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.nm_fakultas ?? "-"}</span> },
    { key: "ipk", label: "IPK", align: "center" as const, render: (item) => <span className="text-sm">{item.ipk ?? "-"}</span> },
    { key: "semester_aktif", label: "Smt", align: "center" as const, render: (item) => <span className="text-sm">{item.semester_aktif ?? "-"}</span> },
    { key: "status_kandidat", label: "Status", render: (item) => (
      <Chip size="sm" color={kandidatStatusColor[item.status_kandidat] || "default"} variant="flat">{item.status_kandidat}</Chip>
    )},
    { key: "hasil_verifikasi", label: "Verifikasi", render: (item) => item.hasil_verifikasi
      ? <Chip size="sm" color={item.hasil_verifikasi === "valid" ? "success" : "danger"} variant="flat">{item.hasil_verifikasi}</Chip>
      : <span className="text-xs text-gray-400">Belum</span>
    },
    { key: "aksi", label: "Aksi", align: "center" as const, render: (item) => item.status_kandidat === "masuk" && !item.hasil_verifikasi ? (
      <div className="flex gap-1">
        <Button size="sm" color="success" variant="flat" isIconOnly isLoading={actionLoading} onPress={() => handleVerifikasi(item.id_kandidat, "valid")}><FiCheck className="w-3.5 h-3.5" /></Button>
        <Button size="sm" color="danger" variant="flat" isIconOnly isLoading={actionLoading} onPress={() => handleVerifikasi(item.id_kandidat, "dikeluarkan")}><FiX className="w-3.5 h-3.5" /></Button>
      </div>
    ) : null },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Batch — ${batch.kode_batch}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/batch")}><FiArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{batch.nm_batch}</h1>
            <p className="text-sm text-gray-500">{batch.kode_batch} · {batch.nm_layanan}</p>
          </div>
          <Chip size="sm" color={cfg.color} variant="flat">{cfg.label}</Chip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Kandidat", value: batch.jumlah_kandidat, gradient: "from-blue-500 to-blue-600" },
            { label: "Terverifikasi", value: batch.jumlah_terverifikasi, gradient: "from-emerald-500 to-green-600" },
            { label: "Dikeluarkan", value: batch.jumlah_dikeluarkan, gradient: "from-rose-500 to-red-600" },
            { label: "Belum", value: batch.jumlah_kandidat - batch.jumlah_terverifikasi - batch.jumlah_dikeluarkan, gradient: "from-amber-500 to-orange-500" },
          ].map(s => (
            <Card key={s.label} className="border-none shadow-md rounded-xl dark:bg-gray-800">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}><FiUsers className="w-5 h-5" /></div>
                  <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Kandidat Table */}
        <DataTable data={kandidatList} columns={columns} searchable searchKeys={["nim", "nm_mahasiswa", "nm_prodi", "nm_fakultas"]}
          searchPlaceholder="Cari kandidat..." defaultRowsPerPage={50}
          filterSlot={
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="masuk">Masuk</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="dikeluarkan">Dikeluarkan</option>
            </select>
          }
        />

        {/* Finalize */}
        {batch.status !== "terbit" && (
          <div className="flex justify-end">
            <Button color="primary" size="lg" startContent={<FiCheck className="w-5 h-5" />} isLoading={actionLoading} onPress={handleFinalize}>
              Finalkan & Terbitkan SK
            </Button>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
