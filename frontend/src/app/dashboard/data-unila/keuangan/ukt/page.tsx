"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Select, SelectItem, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiList, FiCalendar, FiGrid, FiDollarSign, FiDownload } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import keuanganDataService, { type UktItem, type UktStats } from "@/lib/services/data-unila/keuanganDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";
const fmtRp = (v: number | string) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;

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
            <h3 className="text-xl font-bold text-white">{raw ? value : parseInt(value || "0").toLocaleString("id-ID")}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function UktPage() {
  useRequireAuth();
  const [data, setData] = useState<UktItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<UktStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filterTahun, setFilterTahun] = useState("");
  const [tahunList, setTahunList] = useState<Array<{ tahun: string }>>([]);

  useEffect(() => {
    keuanganDataService.getUktStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    keuanganDataService.getUktFilters().then(r => setTahunList(r.tahun)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    keuanganDataService.getUktList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      tahun: filterTahun || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<UktItem>[] = [
    { key: "nama_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nm_prodi_pdrd || i.nama_prodi}</div>
        <div className="text-xs text-gray-500">{i.nm_fakultas_pdrd || i.nama_fakultas || "-"} · {i.jenjang || "-"}</div>
      </div>
    )},
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm font-bold">{i.tahun}</span>
    )},
    { key: "nama_kelas", label: "KELAS UKT", width: "160px", render: (i) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{i.nama_kelas}</span>
    )},
    { key: "nominal", label: "NOMINAL", width: "160px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">{fmtRp(i.nominal)}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Data UKT"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data UKT</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Uang Kuliah Tunggal per program studi dan tahun</p>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FiList className="w-6 h-6" />} label="Total Data" value={stats.total} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiCalendar className="w-6 h-6" />} label="Rentang Tahun" value={`${stats.tahun_awal}–${stats.tahun_akhir}`} color="from-green-500 to-emerald-600" raw />
            <StatCard icon={<FiGrid className="w-6 h-6" />} label="Total Prodi" value={stats.total_prodi} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiDollarSign className="w-6 h-6" />} label="Rata-rata UKT" value={fmtRp(stats.avg_nominal || 0)} color="from-amber-500 to-orange-500" raw />
          </div>
        )}

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                onPageChange={setPage} onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }} onSortChange={handleSort}
                searchPlaceholder="Cari nama prodi, kelas UKT..." defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select aria-label="Tahun" placeholder="Semua Tahun"
                      selectedKeys={filterTahun ? [filterTahun] : []}
                      onSelectionChange={k => { setFilterTahun(Array.from(k)[0] as string || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[140px]", trigger: "h-10" }}>
                      {tahunList.map(t => <SelectItem key={String(t.tahun)}>{String(t.tahun)}</SelectItem>)}
                    </Select>
                    <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />}
                      onPress={() => exportToExcel(
                        data as unknown as Record<string, unknown>[],
                        `keuangan-ukt`,
                        'UKT',
                        { nama_prodi: 'Program Studi', nm_fakultas: 'Fakultas', tahun: 'Tahun', nama_kelas: 'Kelas UKT', nominal: 'Nominal' }
                      )}
                      className="h-10 font-medium ml-auto">Export Excel</Button>
                  </div>
                }
              />
            </motion.div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
