"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiClock, FiLoader, FiCheckCircle, FiEye, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getAdminPengajuan, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { Pengajuan, StatusPengajuan, JenisLayanan } from "@/lib/services/sim-bak/types";

const statusChipColor: Record<string, "default" | "primary" | "warning" | "secondary" | "success" | "danger"> = {
  draft: "default", diajukan: "primary", perlu_perbaikan: "warning", diverifikasi: "secondary",
  menunggu_persetujuan: "warning", disetujui: "success", ditolak: "danger", terbit: "success",
};
const statusLabel: Record<string, string> = {
  draft: "Draft", diajukan: "Diajukan", perlu_perbaikan: "Perlu Perbaikan", diverifikasi: "Diverifikasi",
  menunggu_persetujuan: "Menunggu Persetujuan", disetujui: "Disetujui", ditolak: "Ditolak", terbit: "Terbit",
};

export default function VerifikasiPengajuanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Pengajuan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLayanan, setFilterLayanan] = useState("");
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [page, setPage] = useState(1);

  const verifikasiStatuses = ["diajukan", "perlu_perbaikan", "diverifikasi"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminPengajuan({
        page, limit: 10,
        status: filterStatus || undefined,
        kode_layanan: filterLayanan || undefined,
      });
      // Filter only verifikasi statuses client-side if API returns all
      const filtered = filterStatus
        ? result.data
        : result.data.filter((p: Pengajuan) => verifikasiStatuses.includes(p.status));
      setData(filtered);
      setTotal(result.pagination?.total ?? filtered.length);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterLayanan]);

  useEffect(() => { getJenisLayananPublic().then(setLayananList).catch(() => {}); }, []);
  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const countByStatus = useMemo(() => ({
    menunggu: data.filter(p => p.status === "diajukan").length,
    proses: data.filter(p => p.status === "perlu_perbaikan").length,
    selesai: data.filter(p => p.status === "diverifikasi").length,
  }), [data]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<Pengajuan>[] = [
    { key: "nomor_permohonan", label: "No. Pengajuan", render: (item) => <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.nomor_permohonan}</span> },
    { key: "pemohon", label: "Pemohon", render: (item) => (
      <div>
        <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_mahasiswa || "-"}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.nim || ""}</p>
      </div>
    )},
    { key: "layanan", label: "Layanan", render: (item) => <span className="text-sm">{item.nm_layanan || "-"}</span> },
    { key: "tgl_diajukan", label: "Tgl Ajuan", render: (item) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {item.tgl_diajukan ? new Date(item.tgl_diajukan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
      </span>
    )},
    { key: "status", label: "Status", render: (item) => (
      <Chip size="sm" variant="flat" color={statusChipColor[item.status] || "default"}>{statusLabel[item.status] || item.status}</Chip>
    )},
    { key: "aksi", label: "Aksi", align: "center" as const, render: (item) => (
      <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
        onPress={() => router.push(`/dashboard/sim-bak/admin/verifikasi/${item.id_pengajuan}`)}>Lihat</Button>
    )},
  ];

  const statCards = [
    { label: "Menunggu Verifikasi", value: countByStatus.menunggu, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-400 to-amber-600" },
    { label: "Perlu Perbaikan", value: countByStatus.proses, icon: <FiLoader className="w-6 h-6" />, gradient: "from-blue-400 to-blue-600" },
    { label: "Terverifikasi", value: countByStatus.selesai, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-green-400 to-green-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Verifikasi Pengajuan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Verifikasi Pengajuan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola dan verifikasi pengajuan mahasiswa</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiAlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Belum ada pengajuan</p>
            <p className="text-sm">Pengajuan baru akan muncul di sini</p>
          </div>
        ) : (
          <DataTable data={data} columns={columns} searchable searchKeys={["nomor_permohonan", "nm_mahasiswa", "nm_layanan"]}
            searchPlaceholder="Cari no. pengajuan, pemohon, layanan..." defaultRowsPerPage={10}
            filterSlot={
              <div className="flex flex-wrap gap-3">
                <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                  value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">Semua Status</option>
                  {verifikasiStatuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
                <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                  value={filterLayanan} onChange={(e) => { setFilterLayanan(e.target.value); setPage(1); }}>
                  <option value="">Semua Layanan</option>
                  {layananList.filter(l => l.a_aktif).map(l => <option key={l.kode_layanan} value={l.kode_layanan}>{l.nm_layanan}</option>)}
                </select>
              </div>
            }
          />
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
