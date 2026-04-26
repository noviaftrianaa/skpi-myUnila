"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiLayers, FiFileText, FiCheckCircle, FiClock, FiEye, FiPlus, FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getBatchList, deleteBatch } from "@/lib/services/sim-bak/simBakService";
import type { BatchPenetapan } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

const statusConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "danger" }> = {
  draft: { label: "Draft", color: "default" },
  verifikasi_fakultas: { label: "Verifikasi Fakultas", color: "warning" },
  finalisasi: { label: "Finalisasi", color: "primary" },
  terbit: { label: "Terbit", color: "success" },
};

const jenisSkConfig: Record<string, { label: string; tw: string }> = {
  habis_masa_mukim: { label: "HMM", tw: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  putus_studi: { label: "Putus Studi", tw: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

export default function BatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BatchPenetapan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<BatchPenetapan | null>(null);
  const [deleteAlasan, setDeleteAlasan] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal) return;
    const needsAlasan = deleteModal.status === "verifikasi_fakultas";
    if (needsAlasan && deleteAlasan.trim().length < 10) {
      toast.error("Alasan wajib diisi minimal 10 karakter");
      return;
    }
    setDeleting(true);
    try {
      await deleteBatch(deleteModal.id_batch_penetapan, deleteAlasan || undefined);
      toast.success("Batch berhasil dihapus");
      setDeleteModal(null);
      setDeleteAlasan("");
      fetchData();
    } catch (e) {
      const msg = (e as Record<string, Record<string, Record<string, string>>>)?.response?.data?.message || "Gagal menghapus evaluasi";
      toast.error(msg);
    } finally { setDeleting(false); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBatchList({ page, limit: 10, jenis_batch: filterJenis || undefined, status: filterStatus || undefined });
      setData(result.data);
      setTotal(result.pagination?.total ?? 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [page, filterJenis, filterStatus]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const statCards = [
    { label: "Total Evaluasi", value: total, icon: <FiLayers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Draft", value: data.filter(b => b.status === "draft").length, icon: <FiFileText className="w-6 h-6" />, gradient: "from-gray-400 to-gray-500" },
    { label: "Verifikasi", value: data.filter(b => b.status === "verifikasi_fakultas").length, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Terbit", value: data.filter(b => b.status === "terbit").length, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
  ];

  const columns: Column<BatchPenetapan>[] = [
    { key: "kode_batch", label: "Kode Batch", sortable: true, render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.kode_batch}</span> },
    { key: "nm_batch", label: "Nama", sortable: true, render: (item) => <span className="text-sm text-gray-900 dark:text-white">{item.nm_batch}</span> },
    { key: "jenis_batch", label: "Jenis", sortable: true, render: (item) => {
      const cfg = jenisSkConfig[item.jenis_batch];
      return cfg ? <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.tw}`}>{cfg.label}</span> : <span>{item.jenis_batch}</span>;
    }},
    { key: "status", label: "Status", sortable: true, render: (item) => {
      const cfg = statusConfig[item.status];
      return <Chip size="sm" color={cfg?.color || "default"} variant="flat">{cfg?.label || item.status}</Chip>;
    }},
    { key: "jumlah_kandidat", label: "Kandidat", align: "center" as const, render: (item) => <span className="text-sm font-semibold">{item.jumlah_kandidat}</span> },
    { key: "aksi", label: "Aksi", align: "center" as const, render: (item) => {
      const canDelete = ["draft", "kandidat_ditarik", "verifikasi_fakultas"].includes(item.status);
      return (
        <div className="flex items-center justify-center gap-1">
          <Button size="sm" variant="flat" color="primary" isIconOnly title="Lihat detail"
            onPress={() => router.push(`/dashboard/sim-bak/batch/${item.id_batch_penetapan}`)}><FiEye className="w-4 h-4" /></Button>
          {canDelete && (
            <Button size="sm" variant="flat" color="danger" isIconOnly title="Hapus batch"
              onPress={() => { setDeleteModal(item); setDeleteAlasan(""); }}><FiTrash2 className="w-4 h-4" /></Button>
          )}
        </div>
      );
    }},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Evaluasi Studi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Evaluasi Studi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola evaluasi penetapan Habis Masa Mukim dan Putus Studi</p>
          </div>
          <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => router.push("/dashboard/sim-bak/batch/create")}>Buat Evaluasi Baru</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>{card.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiAlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Belum ada evaluasi</p>
            <p className="text-sm">Buat evaluasi baru untuk memulai</p>
          </div>
        ) : (
          <DataTable data={data} columns={columns} searchable searchKeys={["kode_batch", "nm_batch"]} searchPlaceholder="Cari evaluasi..."
            filterSlot={
              <div className="flex gap-2">
                <select className="text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterJenis} onChange={(e) => { setFilterJenis(e.target.value); setPage(1); }}>
                  <option value="">Semua Jenis</option>
                  <option value="habis_masa_mukim">HMM</option>
                  <option value="putus_studi">Putus Studi</option>
                </select>
                <select className="text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="verifikasi_fakultas">Verifikasi Fakultas</option>
                  <option value="finalisasi">Finalisasi</option>
                  <option value="terbit">Terbit</option>
                </select>
              </div>
            }
          />
        )}
      </div>

      {/* Modal Hapus Evaluasi */}
      {deleteModal && (() => {
        const needsAlasan = deleteModal.status === "verifikasi_fakultas";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteModal(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <FiTrash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Evaluasi</h2>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm space-y-1">
                  <p><span className="text-gray-500">Kode:</span> <span className="font-mono font-semibold">{deleteModal.kode_batch}</span></p>
                  <p><span className="text-gray-500">Nama:</span> {deleteModal.nm_batch}</p>
                  <p><span className="text-gray-500">Status:</span> {statusConfig[deleteModal.status]?.label || deleteModal.status}</p>
                  <p><span className="text-gray-500">Kandidat:</span> {deleteModal.jumlah_kandidat} ({deleteModal.jumlah_terverifikasi} terverifikasi)</p>
                </div>
                {needsAlasan && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      Batch sudah ada verifikasi fakultas. Alasan penghapusan WAJIB diisi.
                    </p>
                  </div>
                )}
                {needsAlasan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alasan Penghapusan <span className="text-red-500">*</span>
                    </label>
                    <textarea rows={3} value={deleteAlasan} onChange={e => setDeleteAlasan(e.target.value)}
                      className="w-full text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="Jelaskan alasan menghapus evaluasi (min 10 karakter)..." />
                  </div>
                )}
                <p className="text-xs text-red-600 dark:text-red-400">
                  ⚠️ Tindakan ini tidak dapat dibatalkan. Semua kandidat dan data verifikasi akan dihapus.
                </p>
              </div>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { setDeleteModal(null); setDeleteAlasan(""); }} disabled={deleting}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                  Batal
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-700" />
                <button onClick={handleDelete} disabled={deleting || (needsAlasan && deleteAlasan.trim().length < 10)}
                  className="flex-1 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {deleting ? "Menghapus..." : "Hapus Evaluasi"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayoutWithDynamicMenu>
  );
}
