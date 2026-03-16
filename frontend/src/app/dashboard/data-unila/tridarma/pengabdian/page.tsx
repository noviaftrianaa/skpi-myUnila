"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Chip, Select, SelectItem, Spinner } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiUsers, FiDollarSign } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, { type LitabmasItem, type LitabmasStats } from "@/lib/services/data-unila/tridarmaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";

interface StatCardProps {
  icon: React.ReactNode; label: string; value: string; color: string; raw?: boolean;
}
function StatCard({ icon, label, value, color, raw }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{icon}</div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-white">{raw ? value : parseInt(value || "0").toLocaleString("id-ID")}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function PengabdianPage() {
  useRequireAuth();
  const [data, setData] = useState<LitabmasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<LitabmasStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filterTahun, setFilterTahun] = useState("");

  const tahunList: number[] = [];
  const now = new Date().getFullYear();
  for (let y = now; y >= 2010; y--) tahunList.push(y);

  useEffect(() => {
    tridarmaDataService.getLitabmasStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    tridarmaDataService.getLitabmas({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      jenis: "pengabdian",
      tahun: filterTahun || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<LitabmasItem>[] = [
    { key: "judul", label: "JUDUL PENGABDIAN", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul}</div>
        {i.skim && <div className="text-xs text-gray-500 mt-0.5">Skim: {i.skim}</div>}
      </div>
    )},
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm font-medium">{i.tahun}</span>
    )},
    { key: "total_dana", label: "TOTAL DANA", width: "140px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
        {i.total_dana ? `Rp ${Number(i.total_dana).toLocaleString("id-ID")}` : "-"}
      </span>
    )},
    { key: "lokasi_kegiatan", label: "LOKASI", width: "160px", render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{i.lokasi_kegiatan || "-"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Pengabdian Masyarakat"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pengabdian Masyarakat</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Data pengabdian kepada masyarakat civitas akademika</p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Pengabdian" value={stats.pengabdian} color="from-secondary-500 to-pink-600" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Penelitian" value={stats.penelitian} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiDollarSign className="w-6 h-6" />} label="Total Dana" value={stats.total_dana ? `Rp ${(Number(stats.total_dana) / 1e9).toFixed(1)}M` : "-"} color="from-amber-500 to-orange-500" raw />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari judul pengabdian, skim..." defaultRowsPerPage={20}
                filterSlot={
                  <Select aria-label="Tahun" placeholder="Semua Tahun"
                    selectedKeys={filterTahun ? [filterTahun] : []}
                    onSelectionChange={k => { setFilterTahun(Array.from(k)[0] as string || ""); setPage(1); }}
                    size="sm" variant="bordered" classNames={{ base: "w-[140px]", trigger: "h-10" }}>
                    {tahunList.map(y => <SelectItem key={String(y)}>{String(y)}</SelectItem>)}
                  </Select>
                }
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
