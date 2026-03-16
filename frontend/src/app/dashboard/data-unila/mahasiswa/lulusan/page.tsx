"use client";
import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Select, SelectItem, Spinner } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiAward, FiTrendingUp, FiGrid } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import mahasiswaDataService, { type LulusanItem, type LulusanStats, type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const APP_KEY = "data-unila";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  raw?: boolean;
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
            <h3 className="text-2xl font-bold text-white">
              {raw ? value : (typeof value === "number" ? value.toLocaleString("id-ID") : parseInt(String(value) || "0").toLocaleString("id-ID"))}
            </h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function LulusanPage() {
  useRequireAuth();
  const [data, setData] = useState<LulusanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_lulus");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<LulusanStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");

  useEffect(() => {
    mahasiswaDataService.getLulusanStats({}).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    mahasiswaDataService.getLulusan({
      page, limit,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      angkatan: filterAngkatan || undefined,
    })
      .then(r => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterAngkatan]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const columns: Column<LulusanItem>[] = [
    { key: "nm_pd", label: "NAMA LULUSAN", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_pd}</div>
        <div className="text-xs text-gray-500 mt-0.5">{i.nipd} · {i.jk === "L" ? "Laki-laki" : "Perempuan"}</div>
      </div>
    )},
    { key: "nm_prodi", label: "PRODI", sortable: true, render: (i) => (
      <div>
        <div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi}</div>
        <div className="text-xs text-gray-500">{i.nm_fakultas} · {i.jenjang}</div>
      </div>
    )},
    { key: "angkatan", label: "ANGKATAN", width: "100px", sortable: true, align: "center" as const, render: (i) => (
      <span className="font-mono text-sm">{i.angkatan}</span>
    )},
    { key: "tgl_lulus", label: "TGL LULUS", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">{i.tgl_lulus || "-"}</span>
    )},
    { key: "ipk", label: "IPK", width: "70px", sortable: true, align: "right" as const, render: (i) => (
      <span className={`font-mono text-sm font-bold ${
        Number(i.ipk) >= 3.5 ? "text-green-600 dark:text-green-400" :
        Number(i.ipk) >= 3.0 ? "text-blue-600 dark:text-blue-400" :
        "text-gray-600 dark:text-gray-400"
      }`}>
        {i.ipk ? Number(i.ipk).toFixed(2) : "-"}
      </span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data Lulusan"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Lulusan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alumni Universitas Lampung — filter, cari, dan download</p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="flex justify-center py-4"><Spinner size="sm" color="primary" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Lulusan" value={stats.total} color="from-green-500 to-emerald-600" />
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Rata-rata IPK" value={Number(stats.avg_ipk || 0).toFixed(2)} color="from-blue-500 to-indigo-600" raw />
            <StatCard icon={<FiGrid className="w-6 h-6" />} label="Total Prodi" value={stats.total_prodi} color="from-violet-500 to-purple-600" />
            <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="Total Angkatan" value={stats.total_angkatan} color="from-amber-500 to-orange-500" />
          </div>
        )}

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                serverSide
                totalRecords={total}
                onPageChange={setPage}
                onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }}
                onSortChange={handleSort}
                searchPlaceholder="Cari nama, NIM..."
                defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex flex-wrap gap-2 w-full">
                    <Select
                      aria-label="Angkatan" placeholder="Angkatan"
                      selectedKeys={filterAngkatan ? [filterAngkatan] : []}
                      onSelectionChange={k => { setFilterAngkatan(Array.from(k)[0] as string || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[110px]", trigger: "h-10" }}
                    >
                      {(filters?.angkatan || []).map(a => <SelectItem key={a.angkatan}>{a.angkatan}</SelectItem>)}
                    </Select>
                    <Select
                      aria-label="Fakultas" placeholder="Semua Fakultas"
                      selectedKeys={filterFak ? [filterFak] : []}
                      onSelectionChange={k => { setFilterFak(Array.from(k)[0] as string || ""); setFilterProdi(""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[200px]", trigger: "h-10" }}
                    >
                      {(filters?.fakultas || []).map(f => <SelectItem key={f.id_fakultas}>{f.nm_fakultas}</SelectItem>)}
                    </Select>
                    <Select
                      aria-label="Prodi" placeholder="Semua Prodi"
                      selectedKeys={filterProdi ? [filterProdi] : []}
                      onSelectionChange={k => { setFilterProdi(Array.from(k)[0] as string || ""); setPage(1); }}
                      size="sm" variant="bordered" classNames={{ base: "w-[220px]", trigger: "h-10" }}
                    >
                      {(filters?.prodi || []).map(p => <SelectItem key={p.id_sms}>{p.nm_prodi}</SelectItem>)}
                    </Select>
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
