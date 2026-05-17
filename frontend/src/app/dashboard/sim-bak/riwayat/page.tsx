"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiEye, FiFileText, FiClock, FiCheckCircle, FiXCircle, FiRotateCcw, FiEdit, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { getMyPengajuan, getJenisLayananPublic, deletePengajuanDraft, getMyStats } from "@/lib/services/sim-bak/simBakService";
import toast, { Toaster } from "react-hot-toast";
import type { Pengajuan, StatusPengajuan, JenisLayanan } from "@/lib/services/sim-bak/types";
import { StatusBadge, getStatusLabel } from "../components";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonTable } from "../components/SkeletonCard";
const allStatuses: StatusPengajuan[] = ["draft","diajukan","perlu_perbaikan","diverifikasi","menunggu_persetujuan","disetujui","ditolak","terbit"];
const statusLabelMap: Record<string, string> = { draft:"Draft", diajukan:"Diajukan", perlu_perbaikan:"Perlu Perbaikan", diverifikasi:"Diverifikasi", menunggu_persetujuan:"Menunggu Persetujuan", disetujui:"Disetujui", ditolak:"Ditolak", terbit:"Terbit" };

export default function RiwayatPengajuanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLayanan, setFilterLayanan] = useState("");
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, draft: 0, proses: 0, selesai: 0, ditolak: 0, perbaikan: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPengajuan({ page, limit: 10, status: filterStatus || undefined });
      setData(result.data ?? []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [page, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getMyStats();
      setStats(s);
    } catch { /* keep zeros */ }
  }, []);

  const [deleting, setDeleting] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  useEffect(() => { getJenisLayananPublic().then(setLayananList).catch(() => {}); }, []);
  useEffect(() => { if (user) { fetchData(); fetchStats(); } }, [user, fetchData, fetchStats]);

  const handleDeleteDraft = async (id: string) => {
    setDeleteConfirmId("");
    setDeleting(id);
    try {
      await deletePengajuanDraft(id);
      toast.success("Pengajuan draft berhasil dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus pengajuan");
    } finally {
      setDeleting("");
    }
  };

  const filteredData = useMemo(() => {
    if (!filterLayanan) return data;
    return data.filter(p => p.kode_layanan === filterLayanan);
  }, [data, filterLayanan]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<Pengajuan>[] = [
    { key: "nomor_permohonan", label: "No. Pengajuan", sortable: true,
      render: (item) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{item.nomor_permohonan}</span> },
    { key: "nm_layanan", label: "Jenis Layanan", sortable: true,
      render: (item) => <span className="text-sm text-gray-900 dark:text-white">{item.nm_layanan || "-"}</span> },
    { key: "tgl_diajukan", label: "Tanggal", sortable: true,
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.tgl_diajukan ? new Date(item.tgl_diajukan).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}) : "-"}</span> },
    { key: "status", label: "Status", sortable: true,
      render: (item) => <StatusBadge status={item.status} /> },
    { key: "aksi", label: "Aksi", align: "center" as const, width: "80px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light" className="text-gray-500 hover:text-gray-700">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Aksi Pengajuan" className="min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg text-sm">
            <DropdownItem key="detail" startContent={<FiEye className="w-3.5 h-3.5" />}
              className="text-gray-700 dark:text-gray-300 text-xs py-1.5"
              onPress={() => router.push(`/dashboard/sim-bak/riwayat/${item.id_pengajuan}`)}>
              Lihat Detail
            </DropdownItem>
            {["draft", "perlu_perbaikan"].includes(item.status) ? (
              <DropdownItem key="edit" startContent={<FiEdit className="w-3.5 h-3.5" />}
                className="text-warning text-xs py-1.5"
                onPress={() => {
                  const kategori = item.kategori === "permohonan_akademik" ? "permohonan" : "surat-mandiri";
                  router.push(`/dashboard/sim-bak/${kategori}/${item.kode_layanan}?edit=${item.id_pengajuan}`);
                }}>
                Lanjutkan
              </DropdownItem>
            ) : null}
            {item.status === "draft" ? (
              <DropdownItem key="delete" startContent={<FiTrash2 className="w-3.5 h-3.5" />}
                className="text-danger text-xs py-1.5" color="danger"
                onPress={() => setDeleteConfirmId(item.id_pengajuan)}>
                Hapus Draft
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      ) },
  ];

  const statCards = [
    { label: "Total Pengajuan", value: stats.total, icon: <FiFileText className="w-5 h-5" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Dalam Proses", value: stats.proses, icon: <FiClock className="w-5 h-5" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Selesai", value: stats.selesai, icon: <FiCheckCircle className="w-5 h-5" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Ditolak", value: stats.ditolak, icon: <FiXCircle className="w-5 h-5" />, gradient: "from-rose-500 to-red-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Riwayat Pengajuan">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Riwayat Pengajuan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pantau status dan progres semua pengajuan Anda</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(card => (
            <Card key={card.label} className={`min-w-0 border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${card.gradient}`}>
              <CardBody className="p-4 relative overflow-hidden">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{card.icon}</div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wide">{card.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : filteredData.length === 0 ? (
          <EmptyState
            variant="document"
            title="Belum ada pengajuan"
            description="Ajukan surat atau permohonan dari menu Permohonan Surat / Permohonan Akademik"
            actionLabel="Ajukan Permohonan Surat"
            onAction={() => router.push("/dashboard/sim-bak/surat-mandiri")}
          />
        ) : (
          <DataTable data={filteredData} columns={columns} searchable searchKeys={["nomor_permohonan","nm_layanan"]}
            searchPlaceholder="Cari no. pengajuan atau layanan..." defaultRowsPerPage={10}
            filterSlot={
              <div className="flex flex-wrap items-center gap-2">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Semua Status</option>
                  {allStatuses.map(s => <option key={s} value={s}>{statusLabelMap[s]}</option>)}
                </select>
                <select value={filterLayanan} onChange={e => setFilterLayanan(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Semua Layanan</option>
                  {layananList.filter(l => l.kategori !== "monitoring" && l.kategori !== "batch_administrasi").map(l => <option key={l.kode_layanan} value={l.kode_layanan}>{l.nm_layanan}</option>)}
                </select>
                {(filterStatus || filterLayanan) && (
                  <button onClick={() => { setFilterStatus(""); setFilterLayanan(""); }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FiRotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>
            }
          />
        )}
      </div>
      <ConfirmDialog open={!!deleteConfirmId} title="Hapus Draft" message="Hapus pengajuan draft ini? Semua dokumen yang sudah diupload juga akan dihapus."
        confirmLabel="Hapus" confirmColor="danger" loading={!!deleting}
        onConfirm={() => handleDeleteDraft(deleteConfirmId)} onCancel={() => setDeleteConfirmId("")} />
    </DashboardLayoutWithDynamicMenu>
  );
}
