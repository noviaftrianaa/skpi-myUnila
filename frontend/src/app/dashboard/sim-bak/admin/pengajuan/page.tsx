"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEye, FiMoreVertical, FiSearch, FiRotateCcw, FiDownload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { getAdminPengajuan, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { Pengajuan, JenisLayanan } from "@/lib/services/sim-bak/types";
import { StatusBadge } from "../../components";
import { SkeletonTable } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import toast, { Toaster } from "react-hot-toast";

const allStatuses = [
  { value: "draft", label: "Draft" },
  { value: "diajukan", label: "Diajukan" },
  { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
  { value: "diverifikasi", label: "Diverifikasi" },
  { value: "menunggu_persetujuan", label: "Menunggu Persetujuan" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
  { value: "terbit", label: "Terbit" },
];

export default function SemuaPengajuanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Pengajuan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLayanan, setFilterLayanan] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Stats
  const [stats, setStats] = useState({ total: 0, diajukan: 0, proses: 0, selesai: 0, ditolak: 0 });

  useEffect(() => {
    getJenisLayananPublic().then(list => setLayananList(list.filter(l => l.kategori !== "monitoring"))).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminPengajuan({
        page,
        limit: 15,
        search: search || undefined,
        status: filterStatus || undefined,
        kode_layanan: filterLayanan || undefined,
      });
      const items = result.data ?? [];
      setData(items);
      setTotal(result.pagination?.total ?? items.length);

      // Hitung stats dari data (halaman pertama)
      if (page === 1 && !filterStatus && !filterLayanan && !search) {
        setStats({
          total: result.pagination?.total ?? items.length,
          diajukan: items.filter(p => p.status === "diajukan").length,
          proses: items.filter(p => ["diverifikasi", "menunggu_persetujuan"].includes(p.status)).length,
          selesai: items.filter(p => ["disetujui", "terbit"].includes(p.status)).length,
          ditolak: items.filter(p => p.status === "ditolak").length,
        });
      }
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterLayanan]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const resetFilters = () => {
    setFilterStatus("");
    setFilterLayanan("");
    setSearch("");
    setPage(1);
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<Pengajuan>[] = [
    { key: "nomor_permohonan", label: "No. Pengajuan", sortable: true, width: "200px",
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{item.nomor_permohonan}</span>
        </div>
      )
    },
    { key: "nm_mahasiswa", label: "Pemohon", sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{(item as Record<string, unknown>).nm_mahasiswa as string || "-"}</p>
          <p className="text-xs text-gray-500">{(item as Record<string, unknown>).nim as string || ""}</p>
        </div>
      )
    },
    { key: "nm_layanan", label: "Jenis Layanan",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{item.nm_layanan || "-"}</p>
          <p className="text-xs text-gray-400">{item.kode_layanan}</p>
        </div>
      )
    },
    { key: "nm_prodi", label: "Prodi / Fakultas",
      render: (item) => (
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300">{(item as Record<string, unknown>).nm_prodi as string || "-"}</p>
          <p className="text-xs text-gray-400">{(item as Record<string, unknown>).nm_fakultas as string || ""}</p>
        </div>
      )
    },
    { key: "tgl_diajukan", label: "Tanggal", sortable: true, width: "120px",
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.tgl_diajukan ? new Date(item.tgl_diajukan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
        </span>
      )
    },
    { key: "status", label: "Status", sortable: true, width: "160px",
      render: (item) => <StatusBadge status={item.status} />
    },
    { key: "aksi", label: "Aksi", align: "center" as const, width: "80px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light" className="text-gray-500 hover:text-gray-700">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Aksi" className="min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg text-sm">
            <DropdownItem key="detail" startContent={<FiEye className="w-3.5 h-3.5" />}
              className="text-gray-700 dark:text-gray-300 text-xs py-1.5"
              onPress={() => router.push(`/dashboard/sim-bak/admin/verifikasi/${item.id_pengajuan}`)}>
              Lihat Detail
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
    },
  ];

  const selectClass = "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Semua Pengajuan">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Pengajuan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar seluruh pengajuan layanan dari semua mahasiswa</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, icon: <FiFileText className="w-5 h-5" />, gradient: "from-blue-500 to-blue-600" },
            { label: "Diajukan", value: stats.diajukan, icon: <FiClock className="w-5 h-5" />, gradient: "from-amber-500 to-orange-500" },
            { label: "Dalam Proses", value: stats.proses, icon: <FiCheckCircle className="w-5 h-5" />, gradient: "from-cyan-500 to-teal-500" },
            { label: "Selesai", value: stats.selesai, icon: <FiCheckCircle className="w-5 h-5" />, gradient: "from-emerald-500 to-green-600" },
            { label: "Ditolak", value: stats.ditolak, icon: <FiXCircle className="w-5 h-5" />, gradient: "from-rose-500 to-red-600" },
          ].map(card => (
            <Card key={card.label} className="border-none shadow-md rounded-xl"><CardBody className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>{card.icon}</div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{card.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </CardBody></Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Cari</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Nama, NIM, atau no. pengajuan..."
                className={`${selectClass} pl-9 w-full`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">Semua Status</option>
              {allStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Layanan</label>
            <select value={filterLayanan} onChange={e => { setFilterLayanan(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">Semua Layanan</option>
              {layananList.map(l => <option key={l.kode_layanan} value={l.kode_layanan}>{l.nm_layanan}</option>)}
            </select>
          </div>
          {(filterStatus || filterLayanan || search) && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <FiRotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : data.length === 0 ? (
          <EmptyState
            variant="search"
            title="Tidak ada pengajuan ditemukan"
            description={search || filterStatus || filterLayanan ? "Coba ubah filter pencarian Anda" : "Belum ada pengajuan masuk dari mahasiswa"}
            actionLabel={search || filterStatus || filterLayanan ? "Reset Filter" : undefined}
            onAction={search || filterStatus || filterLayanan ? resetFilters : undefined}
          />
        ) : (
          <DataTable data={data} columns={columns} searchable={false} defaultRowsPerPage={15} />
        )}

        {/* Pagination Info */}
        <p className="text-xs text-gray-400 text-center">
          Menampilkan {data.length} dari {total} pengajuan
        </p>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
